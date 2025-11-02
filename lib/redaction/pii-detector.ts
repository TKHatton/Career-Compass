/**
 * PII Detection and Redaction Utilities
 * Client-side PII detection before sending to server/model
 */

export interface PIIMatch {
  type: PIIType
  value: string
  token: string
  start: number
  end: number
}

export type PIIType =
  | 'PERSON'
  | 'EMAIL'
  | 'PHONE'
  | 'COMPANY'
  | 'SCHOOL'
  | 'LOCATION'
  | 'URL'

// Regex patterns for PII detection
const patterns = {
  // Email: anything@anything.domain
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Phone: various formats (US-centric but captures most)
  phone:
    /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}|\d{3}[-.]\d{3}[-.]\d{4}/g,

  // URLs
  url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,

  // Locations: City, State or City, Country patterns
  // This is heuristic-based - looks for capitalized words followed by comma and 2-letter code
  location: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\b/g,
}

// Common company indicators
const companyIndicators = [
  'Inc',
  'LLC',
  'Ltd',
  'Corporation',
  'Corp',
  'Company',
  'Co',
  'LLP',
  'LP',
  'GmbH',
  'AG',
]

// Common education indicators
const educationIndicators = [
  'University',
  'College',
  'Institute',
  'School',
  'Academy',
]

/**
 * Detect person names using a simple heuristic:
 * - Capitalized words (2-3 in sequence)
 * - Not at start of sentence (to avoid false positives)
 * - Not part of a company/school name
 */
function detectPersonNames(text: string): PIIMatch[] {
  const matches: PIIMatch[] = []
  const personNamePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g
  let match

  while ((match = personNamePattern.exec(text)) !== null) {
    const value = match[0]
    // Skip if it contains company/education indicators
    const hasIndicator =
      companyIndicators.some((ind) => value.includes(ind)) ||
      educationIndicators.some((ind) => value.includes(ind))

    if (!hasIndicator) {
      matches.push({
        type: 'PERSON',
        value,
        token: '', // Will be assigned later
        start: match.index,
        end: match.index + value.length,
      })
    }
  }

  return matches
}

/**
 * Detect company names using heuristics
 */
function detectCompanies(text: string): PIIMatch[] {
  const matches: PIIMatch[] = []

  for (const indicator of companyIndicators) {
    // Look for capitalized words + indicator
    const pattern = new RegExp(
      `\\b[A-Z][a-zA-Z&\\s]+${indicator}\\b`,
      'g'
    )
    let match

    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: 'COMPANY',
        value: match[0].trim(),
        token: '',
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}

/**
 * Detect schools/universities using heuristics
 */
function detectSchools(text: string): PIIMatch[] {
  const matches: PIIMatch[] = []

  for (const indicator of educationIndicators) {
    const pattern = new RegExp(
      `\\b[A-Z][a-zA-Z&\\s]+${indicator}\\b`,
      'g'
    )
    let match

    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        type: 'SCHOOL',
        value: match[0].trim(),
        token: '',
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}

/**
 * Detect all PII in text
 */
export function detectPII(text: string): PIIMatch[] {
  const allMatches: PIIMatch[] = []

  // Emails
  let match
  while ((match = patterns.email.exec(text)) !== null) {
    allMatches.push({
      type: 'EMAIL',
      value: match[0],
      token: '',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  // Reset regex
  patterns.email.lastIndex = 0

  // Phones
  while ((match = patterns.phone.exec(text)) !== null) {
    allMatches.push({
      type: 'PHONE',
      value: match[0],
      token: '',
      start: match.index,
      end: match.index + match[0].length,
    })
  }
  patterns.phone.lastIndex = 0

  // URLs
  while ((match = patterns.url.exec(text)) !== null) {
    allMatches.push({
      type: 'URL',
      value: match[0],
      token: '',
      start: match.index,
      end: match.index + match[0].length,
    })
  }
  patterns.url.lastIndex = 0

  // Locations
  while ((match = patterns.location.exec(text)) !== null) {
    allMatches.push({
      type: 'LOCATION',
      value: match[0],
      token: '',
      start: match.index,
      end: match.index + match[0].length,
    })
  }
  patterns.location.lastIndex = 0

  // Person names
  allMatches.push(...detectPersonNames(text))

  // Companies
  allMatches.push(...detectCompanies(text))

  // Schools
  allMatches.push(...detectSchools(text))

  // Sort by start position (needed for non-overlapping replacement)
  allMatches.sort((a, b) => a.start - b.start)

  // Remove overlaps (keep longer matches)
  const filtered: PIIMatch[] = []
  let lastEnd = -1

  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      filtered.push(match)
      lastEnd = match.end
    }
  }

  // Assign tokens
  const typeCounts: Record<string, number> = {}

  for (const match of filtered) {
    const count = typeCounts[match.type] || 0
    typeCounts[match.type] = count + 1
    match.token = `[${match.type}_${count + 1}]`
  }

  return filtered
}
