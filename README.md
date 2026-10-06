# 키워드 슬롯 스튜디오

판매 이력이 있는 키워드를 월별로 탐색하고, 5×5 룰렛에서 고른 소재의 확장 키워드와 그림 아이디어, 단일 요소 가이드라인 프롬프트를 제공하는 정적 웹 애플리케이션입니다.

> 이미지는 직접 생성하지 않습니다. 외부 이미지 생성 도구에 붙여 넣을 수 있는 요소 가이드라인과 아이디어를 만듭니다.

## 주요 기능

- **월별 판매 키워드**: 1월~12월을 선택하면 해당 월에 판매된 키워드만 5×5 슬롯에 표시합니다.
- **가중 슬롯 추출**: 판매 언급 횟수를 반영해 소재 25개를 무작위로 구성합니다.
- **확장 키워드·그림 아이디어**: 선택한 소재와 연관된 확장 키워드 10개, 3가지 조합 아이디어를 보여 줍니다.
- **요소 가이드라인**: 검정 외곽선 기반의 단일 요소 이미지 프롬프트를 한국어·영어·네거티브 프롬프트·설정 요약으로 제공합니다.
- **브라우저 이미지 자동 크롭**: 첨부 이미지의 가장자리 배경을 분석해 오브젝트 주변 여백을 최소화한 PNG를 만듭니다. 업로드한 원본은 브라우저 밖으로 전송하지 않습니다.

## 기술 구성

| 항목 | 내용 |
| --- | --- |
| 프레임워크 | React 19 + TypeScript + Vite |
| 패키지 관리자 | pnpm 11 |
| 런타임 | Node.js 22 이상 |
| 서버/DB | 없음 — 정적 사이트 |
| 키워드 데이터 | 번들된 판매 키워드 카탈로그 및 별도 정적 확장 키워드 맵 |

## 빠른 실행

### 요구 사항

- Node.js **22 이상**
- pnpm **11 이상**

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

개발 서버가 시작되면 터미널에 표시된 주소(기본 `http://localhost:3000`)에서 열 수 있습니다.

## 명령어

```bash
# TypeScript 검사
pnpm lint

# 프로덕션 빌드
pnpm build

# 빌드 결과 로컬 확인
pnpm preview
```

`pnpm build`의 결과물은 `dist/`에 생성되며, Netlify·Vercel·Cloudflare Pages·GitHub Pages 등 정적 호스팅 환경에 배포할 수 있습니다.

## Vercel 배포

이 프로젝트는 Vite 정적 사이트이며, `vercel.json`에 빌드·출력·SPA 재작성 설정이 포함되어 있습니다.

1. ZIP 파일을 **먼저 압축 해제**합니다. ZIP 자체를 Vercel 또는 GitHub에 단일 파일로 올리지 마세요.
2. Vercel에서 프로젝트를 가져올 때 **Root Directory를 비워 두거나 `./`**로 설정합니다. `src`나 `dist`를 루트로 지정하면 안 됩니다.
3. 배포 루트에는 아래 항목이 나란히 있어야 합니다.

   ```text
   package.json
   src/
   public/
   vercel.json
   ```

4. Vercel 설정을 직접 입력해야 한다면 다음 값을 사용합니다.

   | 설정 | 값 |
   | --- | --- |
   | Framework Preset | Vite |
   | Build Command | `pnpm run build` |
   | Output Directory | `dist` |
   | Install Command | `pnpm install --frozen-lockfile` |
   | Node.js | 22.x |

`TS18003`은 Vercel이 `tsconfig.app.json`과 같은 위치에서 `src/` 폴더를 찾지 못했을 때 발생합니다. 위 네 항목이 같은 배포 루트에 있는지 확인하면 해결됩니다.

## 데이터 구조

실행에 필요한 데이터는 저장소에 포함됩니다.

| 경로 | 용도 |
| --- | --- |
| `src/data/keywordCatalog.json` | 원본 키워드, 영문 키워드, 판매 언급 횟수, 판매 월 |
| `public/keyword-expansions.json` | 원본 키워드별 확장 키워드 10개 |
| `public/manus-routes.json` | 페이지 경로 매니페스트 |

원본 판매 스프레드시트, 키워드 생성 캐시, `node_modules/`, 빌드 산출물(`dist/`)은 저장소에 포함하지 않습니다. `scripts/`의 데이터 재생성 스크립트는 원본 데이터가 있는 내부 작업 환경을 위한 보조 도구입니다.

## 프로젝트 구조

```text
src/
  components/       슬롯, 프롬프트, 확장 아이디어, 이미지 크롭 UI
  data/             판매 이력 키워드 카탈로그
  lib/              슬롯 추출, 프롬프트, 자동 크롭 로직
  App.tsx           화면 상태와 사용자 흐름
public/
  keyword-expansions.json  확장 키워드 정적 데이터
  manus-routes.json        라우트 매니페스트
scripts/            카탈로그 생성 보조 스크립트
```

## GitHub로 올리기

새 저장소를 만든 뒤 아래처럼 원격 저장소를 연결합니다.

```bash
git remote set-url origin https://github.com/<계정명>/<저장소명>.git
git push -u origin main
```

현재 작업 디렉터리에 이미 다른 `origin`이 연결되어 있지 않은 경우에는 `git remote add origin <저장소 URL>`을 사용하면 됩니다.

## 라이선스

라이선스는 아직 지정하지 않았습니다. 외부 공개 전에는 사용 목적에 맞는 라이선스를 추가해 주세요.
