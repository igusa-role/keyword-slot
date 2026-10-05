interface FilterChipsProps<T extends string> {
  label: string
  options: readonly T[]
  value: T | '전체'
  onChange: (value: T | '전체') => void
  counts?: Partial<Record<T, number>>
}

export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  counts,
}: FilterChipsProps<T>) {
  return (
    <section className="filter-group" aria-label={label}>
      <p className="eyebrow">{label}</p>
      <div className="filter-chips">
        <button className={value === '전체' ? 'chip active' : 'chip'} onClick={() => onChange('전체')}>
          전체
        </button>
        {options.map((option) => (
          <button
            key={option}
            className={value === option ? 'chip active' : 'chip'}
            onClick={() => onChange(option)}
          >
            {option}{counts?.[option] ? <span>{counts[option]}</span> : null}
          </button>
        ))}
      </div>
    </section>
  )
}
