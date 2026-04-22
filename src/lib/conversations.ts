// src/lib/conversations.ts

export const CONVERSATION_EXPIRY_DAYS = 7
export const CONVERSATION_WARNING_DAYS = 5  // warn after 5 days (2 days before expiry)
export const CONVERSATION_POLL_MS = 5000    // thread polling interval
export const INBOX_POLL_MS = 10000          // inbox polling interval

/** Normalize any material string to the DB material_type enum value */
export const MATERIAL_NORM: Record<string, string> = {
  PLA: 'PLA', ABS: 'ABS', PETG: 'PETG',
  Resin: 'resin', resin: 'resin', RESIN: 'resin',
  TPU: 'TPU', Nylon: 'nylon', nylon: 'nylon', NYLON: 'nylon',
  ASA: 'other', Other: 'other', other: 'other',
}

/** Returns 'expired' | 'warning' | 'active' based on last activity time */
export function expiryStatus(lastMessageAt: string | null | undefined): 'expired' | 'warning' | 'active' {
  if (!lastMessageAt) return 'active'
  const days = (Date.now() - new Date(lastMessageAt).getTime()) / 86_400_000
  if (days > CONVERSATION_EXPIRY_DAYS) return 'expired'
  if (days > CONVERSATION_WARNING_DAYS) return 'warning'
  return 'active'
}

/** Days remaining before a conversation expires (clamped to 0) */
export function daysUntilExpiry(lastMessageAt: string | null | undefined): number {
  if (!lastMessageAt) return CONVERSATION_EXPIRY_DAYS
  const daysSince = (Date.now() - new Date(lastMessageAt).getTime()) / 86_400_000
  return Math.max(0, Math.ceil(CONVERSATION_EXPIRY_DAYS - daysSince))
}
