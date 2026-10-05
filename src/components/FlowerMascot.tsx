interface FlowerMascotProps {
  className?: string
  label?: string
}

const MASCOT_URL = '/manus-storage/async-images/XYbfoSRAaIfXVZN9D76DyM/image-1.webp'

export function FlowerMascot({ className = '', label = '핑크 플라워 마스코트' }: FlowerMascotProps) {
  return (
    <div className={`flower-mascot ${className}`.trim()}>
      <span className="mascot-spark mascot-spark-one">✦</span>
      <span className="mascot-spark mascot-spark-two">✦</span>
      <img src={MASCOT_URL} alt={label} decoding="async" />
    </div>
  )
}
