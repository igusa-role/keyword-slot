import type { PromptOutput } from '../types'

interface PromptInput {
  primaryKeyword?: string
  primaryKeywordEnglish?: string
  selectedKeywords: string[]
}

function buildElementGuideline(subject: string): string {
  return `Create exactly one isolated, standalone black outline illustration of ${subject}. This is the only drawn subject: do not add a second object, companion, character, background scene, prop, symbol, or decoration. Use a minimalist, cute, and casual 2D line-art clipart style, matching simple hand-drawn everyday object icons. Line style: draw the entire object using clean, smooth, moderately thick, uniform black strokes. Use rounded stroke caps, rounded corners, and softly connected curves. Maintain a consistent line thickness across the entire illustration, including the outer contour and internal details. Lines should feel slightly organic and naturally hand-drawn, but remain neat, confident, and clearly defined. Avoid sketchy, scratchy, doubled, or uneven strokes. Shape and structure: simplify the object into a highly recognizable silhouette using basic geometric shapes, soft rounded edges, and gently irregular curves. Preserve the object's essential structural features while removing unnecessary details. Allow subtle asymmetry and charming, imperfect proportions. Avoid excessive geometric precision, realism, or complicated shapes. Internal details: use only the minimum number of black interior lines necessary to communicate the object's structure, overlapping parts, openings, folds, or distinctive features. Keep large interior areas completely empty and white. Do not add decorative lines, patterns, or unnecessary details. Perspective: use a simple front-facing, side-facing, or slightly tilted three-quarter view, whichever makes the object most recognizable. Keep the illustration visually flat and two-dimensional. Avoid strong perspective, foreshortening, depth, or complex spatial construction. Color and rendering: pure black outlines only. No color fills, no solid black filled areas, no grayscale, no gradients, no shading, no shadows, no highlights, no textures, no hatching, and no lighting effects. The interior of the object must remain pure white or transparent. Composition: draw exactly one complete object, centered on a pure white or transparent background, with generous empty space around it. Ensure the entire silhouette is clearly visible without cropping. No ground line, background elements, additional objects, decorations, text, or borders. Visual aesthetic: simple everyday object doodle, bold rounded outline icon, minimalist black-and-white line drawing, clean hand-drawn vector clipart, friendly sticker-like simplicity, consistent stroke weight, highly recognizable silhouette. Strict constraints: black strokes only. No colors. No filled shapes. No facial expressions or anthropomorphic features. No complex details. No photorealism. No 3D effects. No sketch texture. No background scene. No additional objects.`
}

export function buildPrompt({ primaryKeyword, primaryKeywordEnglish, selectedKeywords }: PromptInput): PromptOutput | null {
  if (!primaryKeyword || !primaryKeywordEnglish) return null

  return {
    koreanDescription: `주제는 ${primaryKeyword} 하나입니다. 요소 가이드라인 스타일로, 균일한 검정 외곽선과 꼭 필요한 최소 내부선만 사용해 독립된 단일 일러스트로 구성합니다. 내부는 흰색 또는 투명으로 유지합니다.`,
    englishPrompt: buildElementGuideline(primaryKeywordEnglish),
    negativePrompt: 'color, color fill, solid black fill, grayscale, gradients, shading, shadow, highlight, texture, hatching, lighting effects, 3D effects, photorealism, painterly rendering, sketchy strokes, scratchy strokes, doubled lines, uneven stroke weight, thick filled areas, facial expression, anthropomorphic feature, background scene, second subject, companion, extra character, prop, decoration, text, watermark, logo, border',
    settingSummary: `출력 주제: ${primaryKeyword} 1개 · 선택 소재: ${selectedKeywords.length}개 · 스타일: 요소 가이드라인 / 검정 외곽선 2D 라인아트 / 최소 내부선 / 색 채움 없음 / 흰색·투명 배경`,
  }
}
