from __future__ import annotations

import concurrent.futures as cf
import json
import re
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from openai import OpenAI

ROOT = Path('/home/ubuntu/keywordslot')
SOURCE = ROOT / 'src/data/keywordCatalog.json'
CACHE = ROOT / '.keyword_split_cache.json'
AUDIT = Path('/home/ubuntu/output/결합키워드_분리내역.json')
MODEL = 'gpt-5-mini'
MAX_WORKERS = 4

CATEGORIES = [
    '자연·식물', '동물·곤충', '사람·생활', '음식·음료', '기념일·시즌', '교육·사무',
    '교통·여행', '건강·안전', '문화·취미', '비즈니스·금융', '종교·전통', '장식·추상',
]
DIFFICULTIES = ['쉬움', '보통', '어려움']

# Auto-detection is intentionally reviewed with high precision. These phrases
# are coherent visual subjects even though they contain spaces or separators.
MANUAL_KEEP = {
    '2026,붉은말', '3월 키워드 벚꽃', '5월5일 어린이날', '게임 부스 이미지',
    '국화 꽃 모양', '네 잎 클로버', '눈 오는 배경', '분리수거페트병&비닐',
    '붉은말/강조', '오피스여성/남성', '칼슘 등 영양소',
}

# Clearly unrelated subjects collapsed into one source field. These overrides
# also correct typo/word-boundary cases discovered during the manual review.
MANUAL_SPLITS = {
    '라면 구급상다 책읽는아이': ['라면', '구급상자', '책 읽는 아이'],
    '마이크 북 기차 나비 운동장 바톤 꽃 집 오솔길 뒤집게 팝콘 영화표 열기구 왕관 서책 고서 은행나무 테니스공 악보 탬버린': [
        '마이크', '북', '기차', '나비', '운동장', '바톤', '꽃', '집', '오솔길', '뒤집게',
        '팝콘', '영화표', '열기구', '왕관', '서책', '고서', '은행나무', '테니스공', '악보', '탬버린',
    ],
    '바람 파프리카 무지개': ['바람', '파프리카', '무지개'],
    '배구 스파이크 집': ['배구 스파이크', '집'],
    '와인 레드와인 와인글씨': ['와인', '레드와인', '와인글씨'],
    '울타리 낙엽 컨페티': ['울타리', '낙엽', '컨페티'],
    '원플원 2026년 목표달성 습도': ['원플원', '2026년', '목표달성', '습도'],
    '이자오름 주식 돈나무': ['이자오름', '주식', '돈나무'],
    '크리스마스트리 감사 털모자': ['크리스마스트리', '감사', '털모자'],
    '파인애플 결승선 물병': ['파인애플', '결승선', '물병'],
    '하트 싱가포르 유심 바람 손 파프리카': ['하트', '싱가포르', '유심', '바람', '손', '파프리카'],
}

METADATA_OVERRIDES = {
    '운동장': {'category': '문화·취미', 'difficulty': '보통', 'englishKeyword': 'sports field'},
    '뒤집게': {'category': '음식·음료', 'difficulty': '쉬움', 'englishKeyword': 'spatula'},
    '악보': {'category': '문화·취미', 'difficulty': '보통', 'englishKeyword': 'sheet music'},
    '유심': {'category': '비즈니스·금융', 'difficulty': '쉬움', 'englishKeyword': 'SIM card'},
    '레드와인': {'category': '음식·음료', 'difficulty': '쉬움', 'englishKeyword': 'red wine'},
    '싱가포르': {'category': '교통·여행', 'difficulty': '보통', 'englishKeyword': 'Singapore'},
    '서책': {'category': '교육·사무', 'difficulty': '보통', 'englishKeyword': 'bound book'},
}

SPLIT_SYSTEM = '''당신은 한국어 그림 소재 키워드 데이터 정제 전문가입니다.
입력은 판매 키워드 후보입니다. 줄바꿈이나 구분 기호가 사라져 서로 무관한 여러 독립 소재가 하나의 문자열로 붙은 경우에만 분리하세요.

분리 기준:
- "마이크 북 기차 나비 ..."처럼 독립적으로 그림 소재가 될 수 있는 여러 명사/소재의 나열은 반드시 분리합니다.
- "하트 싱가포르 유심 바람 손 파프리카"처럼 서로 무관한 소재 나열은 분리합니다.
- "라면 구급상자 책읽는아이"처럼 독립 소재가 나열된 경우는 분리합니다.
- 한 가지 의미를 이루는 합성어·수식어구·행사명·캐릭터명·스타일 설명은 절대로 분리하지 않습니다. 예: "가을나무", "책 읽는 아이", "크리스마스 트리", "강아지 발바닥", "봄 꽃 튤립", "산(동양화 스타일)".
- 목록을 분리할 때 각 결과는 한국어의 짧은 독립 그림 소재 키워드만 반환합니다. 조사·설명문·숫자 목록 표시는 제거합니다.
- 확신이 없으면 분리하지 않습니다.

모든 입력 id를 정확히 한 번 반환하세요. split=false이면 parts에는 원문 하나만 넣으세요.'''

CLASSIFY_SYSTEM = '''당신은 한국어 그림 소재 키워드 분류 및 영문 프롬프트 번역 전문가입니다.
각 원자 키워드를 아래 12개 카테고리와 3개 난이도로 분류하고, 외부 이미지 생성 프롬프트에 바로 쓸 자연스러운 짧은 영어 명사구로 번역하세요.

카테고리(반드시 하나):
- 자연·식물: 꽃, 나무, 날씨, 계절 자연물, 지형, 과일·채소 등
- 동물·곤충: 동물, 새, 물고기, 곤충 등
- 사람·생활: 인물, 가족, 일상 행동, 의복, 주거, 생활 물품 등
- 음식·음료: 음식, 식재료, 음료, 조리·식기 등
- 기념일·시즌: 명절, 계절·월별 행사, 기념일, 축제, 졸업 등
- 교육·사무: 학교, 독서, 문서, 사무, 학습 도구 등
- 교통·여행: 이동수단, 도로, 지역, 관광, 여행 등
- 건강·안전: 의료, 운동, 위생, 안전, 재난 등
- 문화·취미: 음악, 스포츠, 예술, 놀이, 미디어, 취미 등
- 비즈니스·금융: 경제, 쇼핑, 업무, 금융, 디지털 서비스 등
- 종교·전통: 종교, 전통 문화, 국가 상징, 역사 등
- 장식·추상: 하트, 아이콘, 패턴, 감정, 기호, 추상 요소 등

난이도: 쉬움(단일 친숙 소재), 보통(간단한 복합 소재·행사명·동작), 어려움(여러 대상 관계·전문 소재·복잡 개념).
영문은 한국어를 남기지 말고 짧고 자연스러운 image-generation noun phrase로 작성하세요.'''

SPLIT_SCHEMA: dict[str, Any] = {
    'type': 'json_schema',
    'json_schema': {
        'name': 'composite_keyword_split',
        'strict': True,
        'schema': {
            'type': 'object',
            'properties': {
                'items': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'split': {'type': 'boolean'},
                            'parts': {'type': 'array', 'items': {'type': 'string'}},
                        },
                        'required': ['id', 'split', 'parts'],
                        'additionalProperties': False,
                    },
                },
            },
            'required': ['items'],
            'additionalProperties': False,
        },
    },
}

CLASSIFY_SCHEMA: dict[str, Any] = {
    'type': 'json_schema',
    'json_schema': {
        'name': 'split_keyword_metadata',
        'strict': True,
        'schema': {
            'type': 'object',
            'properties': {
                'items': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer'},
                            'category': {'type': 'string', 'enum': CATEGORIES},
                            'difficulty': {'type': 'string', 'enum': DIFFICULTIES},
                            'englishKeyword': {'type': 'string'},
                        },
                        'required': ['id', 'category', 'difficulty', 'englishKeyword'],
                        'additionalProperties': False,
                    },
                },
            },
            'required': ['items'],
            'additionalProperties': False,
        },
    },
}


def candidate(item: dict[str, Any]) -> bool:
    korean = item['keyword'].strip()
    english = item['englishKeyword'].strip()
    token_count = len(korean.split())
    compact_length = len(re.sub(r'[^가-힣A-Za-z0-9]', '', korean))
    english_words = len(re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?|\d+", english))
    has_list_separator = bool(re.search(r'(?<!\()[,/&](?![^()]*\))', korean))
    return token_count >= 3 or compact_length >= 14 or english_words >= 5 or has_list_separator


def call_model(system: str, schema: dict[str, Any], payload: list[dict[str, Any]], label: str) -> list[dict[str, Any]]:
    expected_ids = {item['id'] for item in payload}
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            response = OpenAI().chat.completions.create(
                model=MODEL,
                messages=[
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': f'다음 JSON 배열을 처리하세요.\n{json.dumps(payload, ensure_ascii=False)}'},
                ],
                response_format=schema,
                max_completion_tokens=6000,
                extra_body={'reasoning': {'effort': 'minimal'}},
            )
            data = json.loads(response.choices[0].message.content)['items']
            ids = [item['id'] for item in data]
            if set(ids) != expected_ids or len(ids) != len(expected_ids):
                raise ValueError(f'{label} response IDs did not match')
            return data
        except Exception as error:
            last_error = error
            time.sleep(2 ** attempt)
    raise RuntimeError(f'{label} failed after retries: {last_error}')


def split_candidates(candidates: list[dict[str, Any]], fingerprint: list[dict[str, str]]) -> dict[str, list[str]]:
    if CACHE.exists():
        cached = json.loads(CACHE.read_text(encoding='utf-8'))
        if cached.get('fingerprint') == fingerprint:
            print('Using cached split decisions')
            result = cached['splits']
            result = {keyword: parts for keyword, parts in result.items() if keyword not in MANUAL_KEEP}
            result.update(MANUAL_SPLITS)
            return result

    payload = [
        {'id': index, 'keyword': item['keyword'], 'englishKeyword': item['englishKeyword']}
        for index, item in enumerate(candidates, start=1)
    ]
    decisions = call_model(SPLIT_SYSTEM, SPLIT_SCHEMA, payload, 'split decision')
    result: dict[str, list[str]] = {}
    for source, decision in zip(candidates, sorted(decisions, key=lambda item: item['id']), strict=True):
        raw_parts = [re.sub(r'\s+', ' ', part).strip(' ,/·') for part in decision['parts']]
        parts = list(dict.fromkeys(part for part in raw_parts if part))
        # Treat malformed or uncertain answers as a no-split decision.
        if decision['split'] and len(parts) >= 2 and source['keyword'] not in parts:
            result[source['keyword']] = parts
    CACHE.write_text(json.dumps({'fingerprint': fingerprint, 'splits': result}, ensure_ascii=False, indent=2), encoding='utf-8')
    result = {keyword: parts for keyword, parts in result.items() if keyword not in MANUAL_KEEP}
    result.update(MANUAL_SPLITS)
    return result


def classify_new_keywords(keywords: list[str]) -> dict[str, dict[str, str]]:
    if not keywords:
        return {}
    indexed = [{'id': index, 'keyword': keyword} for index, keyword in enumerate(keywords, start=1)]
    batches = [indexed[start:start + 100] for start in range(0, len(indexed), 100)]
    results: dict[int, dict[str, str]] = {}
    with cf.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(call_model, CLASSIFY_SYSTEM, CLASSIFY_SCHEMA, batch, 'new keyword classification') for batch in batches]
        for future in cf.as_completed(futures):
            for item in future.result():
                results[item['id']] = {
                    'category': item['category'],
                    'difficulty': item['difficulty'],
                    'englishKeyword': item['englishKeyword'].strip(),
                }
    return {item['keyword']: results[item['id']] for item in indexed}


def main() -> None:
    catalog: list[dict[str, Any]] = json.loads(SOURCE.read_text(encoding='utf-8'))
    candidates = [item for item in catalog if candidate(item)]
    fingerprint = [{'keyword': item['keyword'], 'englishKeyword': item['englishKeyword']} for item in candidates]
    splits = split_candidates(candidates, fingerprint)

    totals: Counter[str] = Counter()
    for item in catalog:
        parts = splits.get(item['keyword'], [item['keyword']])
        for part in parts:
            totals[part] += int(item['salesCount'])

    source_metadata = {
        item['keyword']: {
            'category': item['category'],
            'difficulty': item['difficulty'],
            'englishKeyword': item['englishKeyword'],
        }
        for item in catalog
    }
    new_keywords = sorted(keyword for keyword in totals if keyword not in source_metadata)
    new_metadata = classify_new_keywords(new_keywords)
    metadata_by_keyword = {**source_metadata, **new_metadata, **METADATA_OVERRIDES}

    final_catalog = []
    for keyword in sorted(totals, key=lambda value: value.casefold()):
        metadata = metadata_by_keyword[keyword]
        final_catalog.append({
            'keyword': keyword,
            'salesCount': totals[keyword],
            **metadata,
        })

    audit_entries = []
    for source, parts in splits.items():
        audit_entries.append({
            'sourceKeyword': source,
            'sourceSalesCount': next(item['salesCount'] for item in catalog if item['keyword'] == source),
            'splitKeywords': [dict(keyword=part, **metadata_by_keyword[part]) for part in parts],
        })

    SOURCE.write_text(json.dumps(final_catalog, ensure_ascii=False, indent=2), encoding='utf-8')
    AUDIT.parent.mkdir(parents=True, exist_ok=True)
    AUDIT.write_text(json.dumps({
        'candidateCount': len(candidates),
        'splitSourceCount': len(splits),
        'beforeUniqueKeywords': len(catalog),
        'afterUniqueKeywords': len(final_catalog),
        'beforeSalesMentions': sum(item['salesCount'] for item in catalog),
        'afterSalesMentions': sum(item['salesCount'] for item in final_catalog),
        'entries': audit_entries,
    }, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'Candidates reviewed: {len(candidates)}')
    print(f'Composite sources split: {len(splits)}')
    print(f'Catalog: {len(catalog)} -> {len(final_catalog)} unique keywords')
    print(f'Sales mentions: {sum(item["salesCount"] for item in catalog)} -> {sum(item["salesCount"] for item in final_catalog)}')
    for entry in audit_entries:
        print(f"SPLIT | {entry['sourceKeyword']} -> {', '.join(item['keyword'] for item in entry['splitKeywords'])}")


if __name__ == '__main__':
    main()
