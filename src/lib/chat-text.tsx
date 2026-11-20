'use client'

import React from 'react'

export interface RenderChatTextOptions {
  isMe?: boolean
  accent?: 'blue' | 'indigo'
  highlightMentions?: boolean
}

const URL_REGEX = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi
const MENTION_REGEX = /@[a-zA-Z0-9À-ÿ_]+/g

function trimTrailingUrlPunctuation(rawUrl: string): { cleanUrl: string; trailing: string } {
  let cleanUrl = rawUrl
  let trailing = ''

  while (cleanUrl.length > 0) {
    const lastChar = cleanUrl[cleanUrl.length - 1]
    if (/[.,;:!?'"»”’]/.test(lastChar)) {
      trailing = lastChar + trailing
      cleanUrl = cleanUrl.slice(0, -1)
      continue
    }
    if (lastChar === ')') {
      const openCount = (cleanUrl.match(/\(/g) || []).length
      const closeCount = (cleanUrl.match(/\)/g) || []).length
      if (closeCount > openCount) {
        trailing = lastChar + trailing
        cleanUrl = cleanUrl.slice(0, -1)
        continue
      }
    }
    if (lastChar === ']') {
      const openCount = (cleanUrl.match(/\[/g) || []).length
      const closeCount = (cleanUrl.match(/\]/g) || []).length
      if (closeCount > openCount) {
        trailing = lastChar + trailing
        cleanUrl = cleanUrl.slice(0, -1)
        continue
      }
    }
    break
  }

  return { cleanUrl, trailing }
}

function getLinkClassName(isMe: boolean, accent: 'blue' | 'indigo'): string {
  if (isMe) {
    return 'underline decoration-white/75 hover:decoration-white text-white font-medium break-all'
  }
  if (accent === 'indigo') {
    return 'underline decoration-indigo-500/60 hover:decoration-indigo-500 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium break-all'
  }
  return 'underline decoration-blue-500/60 hover:decoration-blue-500 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium break-all'
}

function getMentionClassName(isMe: boolean, accent: 'blue' | 'indigo'): string {
  if (accent === 'indigo') {
    return `inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md font-semibold text-[11px] sm:text-xs ${
      isMe
        ? 'bg-indigo-700 text-white'
        : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
    }`
  }
  return `inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md font-semibold text-[11px] sm:text-xs transition-colors ${
    isMe
      ? 'bg-blue-700 text-white shadow-xs'
      : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }`
}

function appendPlainSegment(
  nodes: React.ReactNode[],
  segment: string,
  keyPrefix: string,
  isMe: boolean,
  accent: 'blue' | 'indigo',
  highlightMentions: boolean
) {
  if (!segment) return

  if (!highlightMentions) {
    nodes.push(<React.Fragment key={keyPrefix}>{segment}</React.Fragment>)
    return
  }

  MENTION_REGEX.lastIndex = 0
  let cursor = 0
  let match: RegExpExecArray | null
  let partIdx = 0

  while ((match = MENTION_REGEX.exec(segment)) !== null) {
    const prevChar = match.index > 0 ? segment[match.index - 1] : ''
    if (prevChar && /[a-zA-Z0-9._%+-]/.test(prevChar)) {
      continue
    }

    if (match.index > cursor) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-t-${partIdx++}`}>
          {segment.slice(cursor, match.index)}
        </React.Fragment>
      )
    }

    nodes.push(
      <span key={`${keyPrefix}-m-${partIdx++}`} className={getMentionClassName(isMe, accent)}>
        {match[0]}
      </span>
    )

    cursor = match.index + match[0].length
  }

  if (cursor < segment.length) {
    nodes.push(
      <React.Fragment key={`${keyPrefix}-t-${partIdx++}`}>
        {segment.slice(cursor)}
      </React.Fragment>
    )
  }
}

/**
 * Renderizza il testo dei messaggi chat trasformando gli URL (http/https/www) in link cliccabili
 * sicuri e preservando opzionalmente l'evidenziazione delle @menzioni.
 */
export function renderChatText(
  content: string,
  options?: RenderChatTextOptions
): React.ReactNode {
  if (!content) return null

  const isMe = Boolean(options?.isMe)
  const accent = options?.accent ?? 'blue'
  const highlightMentions = options?.highlightMentions !== false
  const linkClassName = getLinkClassName(isMe, accent)

  const nodes: React.ReactNode[] = []
  URL_REGEX.lastIndex = 0
  let plainStart = 0
  let match: RegExpExecArray | null
  let blockIdx = 0

  while ((match = URL_REGEX.exec(content)) !== null) {
    const rawUrl = match[0]

    if (/^www\./i.test(rawUrl) && match.index > 0) {
      const prevChar = content[match.index - 1]
      if (/[a-zA-Z0-9@._-]/.test(prevChar)) {
        continue
      }
    }

    const { cleanUrl } = trimTrailingUrlPunctuation(rawUrl)
    if (!cleanUrl) continue

    const href = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`

    let isValidUrl = false
    try {
      const parsed = new URL(href)
      isValidUrl =
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        Boolean(parsed.hostname) &&
        (!/^www\./i.test(cleanUrl) || parsed.hostname.length > 4)
    } catch {
      isValidUrl = false
    }

    if (!isValidUrl) continue

    if (match.index > plainStart) {
      appendPlainSegment(
        nodes,
        content.slice(plainStart, match.index),
        `seg-${blockIdx++}`,
        isMe,
        accent,
        highlightMentions
      )
    }

    nodes.push(
      <a
        key={`url-${blockIdx++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={linkClassName}
      >
        {cleanUrl}
      </a>
    )

    plainStart = match.index + cleanUrl.length
  }

  if (plainStart < content.length) {
    appendPlainSegment(
      nodes,
      content.slice(plainStart),
      `seg-${blockIdx++}`,
      isMe,
      accent,
      highlightMentions
    )
  }

  return <span>{nodes}</span>
}
