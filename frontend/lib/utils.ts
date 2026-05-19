/**
 * Format a number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format date to readable format
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Validate IUPAC nucleotide sequence
 */
export function isValidIUPAC(sequence: string): boolean {
  const iupacRegex = /^[ATGCNRYSWKMBDHV]+$/i
  return iupacRegex.test(sequence.replace(/\s/g, ''))
}

/**
 * Get invalid characters from sequence
 */
export function getInvalidCharacters(sequence: string): string[] {
  const iupacChars = new Set('ATGCNRYSWKMBDHV'.split(''))
  const invalid = new Set<string>()

  for (const char of sequence.toUpperCase()) {
    if (!/\s/.test(char) && !iupacChars.has(char)) {
      invalid.add(char)
    }
  }

  return Array.from(invalid)
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Parse FASTA content
 */
export function parseFASTA(content: string): Array<{ header: string; sequence: string }> {
  const records: Array<{ header: string; sequence: string }> = []
  const lines = content.split('\n')
  let currentHeader = ''
  let currentSequence = ''

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('>')) {
      if (currentHeader) {
        records.push({
          header: currentHeader,
          sequence: currentSequence.replace(/\s/g, ''),
        })
      }
      currentHeader = trimmed.substring(1)
      currentSequence = ''
    } else if (trimmed) {
      currentSequence += trimmed
    }
  }

  if (currentHeader) {
    records.push({
      header: currentHeader,
      sequence: currentSequence.replace(/\s/g, ''),
    })
  }

  return records
}

/**
 * Format FASTA output
 */
export function formatFASTA(header: string, sequence: string, lineLength: number = 60): string {
  const lines = [`>${header}`]

  for (let i = 0; i < sequence.length; i += lineLength) {
    lines.push(sequence.substring(i, i + lineLength))
  }

  return lines.join('\n')
}
