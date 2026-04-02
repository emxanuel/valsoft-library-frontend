import { useState } from "react"

export function CoverUrlPreview({
  url,
  title,
  className,
}: {
  url: string | null
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) {
    return (
      <div
        className={`bg-muted shrink-0 rounded-md border border-dashed ${className ?? ""}`}
        aria-hidden
      />
    )
  }
  return (
    <img
      src={url}
      alt={`Cover: ${title}`}
      className={`shrink-0 rounded-md object-cover shadow-sm ${className ?? ""}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
