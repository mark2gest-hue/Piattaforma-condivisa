import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback: string
}

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  const [hasError, setHasError] = React.useState(!src)

  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200 text-slate-700 font-medium text-xs items-center justify-center border border-slate-200 select-none",
        className
      )}
      {...props}
    >
      {!hasError && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}
