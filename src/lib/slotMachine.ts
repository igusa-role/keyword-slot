import type { KeywordItem, SaleMonth } from '../types'

export function filterKeywords(catalog: KeywordItem[], saleMonth: SaleMonth | '전체'): KeywordItem[] {
  if (saleMonth === '전체') return catalog
  return catalog.filter((item) => item.salesMonths.includes(saleMonth))
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

  while (result.length < amount) {
    result.push(pickWeighted(pool))
  }

  return result
}
