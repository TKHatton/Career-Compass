import { detectPII, PIIMatch } from './pii-detector'

export interface RedactionResult {
  redactedText: string
  redactionMap: Record<string, string> // token -> original value
  matches: PIIMatch[]
}

/**
 * Redact PII from text and create a mapping
 */
export function redactText(text: string): RedactionResult {
  const matches = detectPII(text)
  const redactionMap: Record<string, string> = {}

  // Build redaction map
  for (const match of matches) {
    redactionMap[match.token] = match.value
  }

  // Replace in reverse order to preserve indices
  let redactedText = text
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    redactedText =
      redactedText.substring(0, match.start) +
      match.token +
      redactedText.substring(match.end)
  }

  return {
    redactedText,
    redactionMap,
    matches,
  }
}

/**
 * Rehydrate redacted text using the redaction map
 */
export function rehydrateText(
  redactedText: string,
  redactionMap: Record<string, string>
): string {
  let result = redactedText

  // Replace tokens with original values
  for (const [token, value] of Object.entries(redactionMap)) {
    result = result.replaceAll(token, value)
  }

  return result
}

/**
 * Preview redacted text with highlights
 * Useful for showing users what will be redacted before sending
 */
export function previewRedaction(text: string): {
  html: string
  matches: PIIMatch[]
} {
  const matches = detectPII(text)

  // Create HTML with highlighted matches
  let html = ''
  let lastEnd = 0

  for (const match of matches) {
    // Add text before match
    html += escapeHtml(text.substring(lastEnd, match.start))

    // Add highlighted match
    html += `<mark class="bg-yellow-200 px-1 rounded" title="${match.type}">${escapeHtml(
      match.value
    )}</mark>`

    lastEnd = match.end
  }

  // Add remaining text
  html += escapeHtml(text.substring(lastEnd))

  return { html, matches }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
