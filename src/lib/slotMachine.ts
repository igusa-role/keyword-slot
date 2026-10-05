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

  const uniquePool = [...pool]
  const result: KeywordItem[] = []
  while (result.length < amount && uniquePool.length > 0) {
    const picked = pickWeighted(uniquePool)
    result.push(picked)
    uniquePool.splice(uniquePool.findIndex((item) => item.keyword === picked.keyword), 1)
  }

  // A narrow filter can contain fewer than 25 records. Repeat weighted picks in
  // that case so the slot board always remains a complete 5×5 machine.
  while (result.length < amount) {
    result.push(pickWeighted(pool))
  }

  return result
}
