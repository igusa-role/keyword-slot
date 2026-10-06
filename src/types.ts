export const CATEGORY_ORDER = [
  '자연·식물',
  '동물·곤충',
  '사람·생활',
  '음식·음료',
  '기념일·시즌',
  '교육·사무',
  '교통·여행',
  '건강·안전',
  '문화·취미',
  '비즈니스·금융',
  '종교·전통',
  '장식·추상',
] as const

export const DIFFICULTY_ORDER = ['쉬움', '보통', '어려움'] as const

export type Category = (typeof CATEGORY_ORDER)[number]
export type Difficulty = (typeof DIFFICULTY_ORDER)[number]
export type IllustrationStyle = 'outline' | 'fill'

export interface KeywordItem {
  keyword: string
  englishKeyword: string
  category: Category
  difficulty: Difficulty
  salesCount: number
}

export interface PromptOutput {
  koreanDescription: string
  englishPrompt: string
  negativePrompt: string
  settingSummary: string
}
