from __future__ import annotations

import concurrent.futures as cf
import json
import time
from pathlib import Path
from typing import Any

from openai import OpenAI

SOURCE = Path('/home/ubuntu/keywordslot/src/data/keywordCatalog.json')
CACHE = Path('/home/ubuntu/keywordslot/.keyword_translation_cache.json')
MODEL = 'gpt-5-mini'
BATCH_SIZE = 100
MAX_WORKERS = 5

SYSTEM_PROMPT = '''You translate Korean visual-idea keywords into concise, natural English image-generation keywords. Return only the requested JSON.

Rules:
- Translate every keyword into English, retaining the intended visual subject or concept.
- Use short image-friendly noun phrases, not full sentences.
- Keep proper nouns, dates, standard abbreviations, and already-English terms understandable in English.
- Do not add new visual details that are absent from the Korean keyword.
- Return exactly one English phrase for every id.''' 

SCHEMA: dict[str, Any] = {
    'type': 'json_schema',
    'json_schema': {
        'name': 'english_keyword_translation',
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
                            'englishKeyword': {'type': 'string'},
                        },
                        'required': ['id', 'englishKeyword'],
                        'additionalProperties': False,
                    },
                },
            },
            'required': ['items'],
            'additionalProperties': False,
        },
    },
}


def load_catalog() -> list[dict[str, Any]]:
    return json.loads(SOURCE.read_text(encoding='utf-8'))


def translate_batch(batch: list[dict[str, Any]]) -> dict[int, str]:
    expected_ids = {item['id'] for item in batch}
    payload = [{'id': item['id'], 'keyword': item['keyword']} for item in batch]
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            response = OpenAI().chat.completions.create(
                model=MODEL,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': 'Translate every keyword in this JSON array.\n' + json.dumps(payload, ensure_ascii=False)},
                ],
                response_format=SCHEMA,
                max_completion_tokens=5000,
                extra_body={'reasoning': {'effort': 'minimal'}},
            )
            data = json.loads(response.choices[0].message.content)
            ids = [item['id'] for item in data['items']]
            if set(ids) != expected_ids or len(ids) != len(expected_ids):
                raise ValueError('Translation response IDs did not match batch IDs')
            return {item['id']: item['englishKeyword'].strip() for item in data['items']}
        except Exception as error:
            last_error = error
            time.sleep(2 ** attempt)
    raise RuntimeError(f'Translation failed after retries: {last_error}')


def main() -> None:
    catalog = load_catalog()
    indexed = [dict(item, id=index) for index, item in enumerate(catalog, start=1)]
    cached: dict[int, str] = {}
    if CACHE.exists():
        raw = json.loads(CACHE.read_text(encoding='utf-8'))
        if raw.get('keywords') == [item['keyword'] for item in catalog]:
            cached = {int(key): value for key, value in raw.get('translations', {}).items()}

    missing = [item for item in indexed if item['id'] not in cached]
    if missing:
        batches = [missing[start:start + BATCH_SIZE] for start in range(0, len(missing), BATCH_SIZE)]
        with cf.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [executor.submit(translate_batch, batch) for batch in batches]
            for index, future in enumerate(cf.as_completed(futures), start=1):
                cached.update(future.result())
                print(f'Translated {index}/{len(batches)} batches')
        CACHE.write_text(json.dumps({
            'keywords': [item['keyword'] for item in catalog],
            'translations': cached,
        }, ensure_ascii=False), encoding='utf-8')

    for item, indexed_item in zip(catalog, indexed, strict=True):
        item['englishKeyword'] = cached[indexed_item['id']]
    SOURCE.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Added English translations for {len(catalog)} keywords')


if __name__ == '__main__':
    main()
