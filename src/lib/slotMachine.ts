import type { Category, Difficulty, KeywordItem } from '../types'

export function filterKeywords(
  catalog: KeywordItem[],
  category: Category | '전체',
  difficulty: Difficulty | '전체',
): KeywordItem[] {
  return catalog.filter((item) =>
    (category === '전체' || item.category === category) &&
    (difficulty === '전체' || item.difficulty === difficulty),
  )
}

function pickWeighted(items: KeywordItem[]): KeywordItem {
  const totalWeight = items.reduce((total, item) => total + Math.max(1, item.salesCount), 0)
  let cursor = Math.random() * totalWeight

  for (const item of items) {
    cursor -= Math.max(1, item.salesCount)
    if (cursor <= 0) return item
  }

  return items[items.length - 1]
}

export function drawSlots(pool: KeywordItem[], amount = 25): KeywordItem[] {
  if (pool.length === 0) return []
  const source = [...pool]
  const result: KeywordItem[] = []

  while (result.length < amount && source.length > 0) {
    const picked = pickWeighted(source)
    result.push(picked)
    source.splice(source.findIndex((item) => item.keyword === picked.keyword), 1)
  }

  return result
}

export function categorySales(catalog: KeywordItem[], category: Category): number {
  return catalog
    .filter((item) => item.category === category)
    .reduce((total, item) => total + item.salesCount, 0)
}
