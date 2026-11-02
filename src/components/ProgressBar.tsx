export function ProgressBar({ value, small }: { value: number; small?: boolean }) {
  const pct = Math.round(value * 100)
  return (
    <div className={small ? 'progress small' : 'progress'} title={`${pct}% done`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
      {!small && <span className="progress-label">{pct}% done</span>}
    </div>
  )
}
