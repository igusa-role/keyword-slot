export const MONTH_OPTIONS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] as const

export type SaleMonth = (typeof MONTH_OPTIONS)[number]

export interface KeywordItem {
  keyword: string
  englishKeyword: string
  salesCount: number
  salesDates: string[]
  salesMonths: SaleMonth[]
}

export interface PromptOutput {
  koreanDescription: string
  englishPrompt: string
  negativePrompt: string
  settingSummary: string
}
