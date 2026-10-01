/**
 * Utility di mascheramento sicuro per i Codici Referral.
 * Trasforma un codice reale (es. "AI-LFB4E4") in un token opaco (es. "REF-7B91A2")
 * in modo che non sia visibile il codice di login e non sia riutilizzabile come password.
 */

const SALT = 0x5a3c

export function encodeReferralCode(realCode: string): string {
  if (!realCode) return ''
  const clean = realCode.trim().toUpperCase()
  
  let hex = ''
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i)
    const encoded = charCode ^ ((SALT + i * 7) & 0xff)
    hex += encoded.toString(16).padStart(2, '0').toUpperCase()
  }
  
  return `REF-${hex}`
}

export function decodeReferralCode(tokenOrCode: string): string {
  if (!tokenOrCode) return ''
  const clean = tokenOrCode.trim()

  if (clean.toUpperCase().startsWith('REF-')) {
    const hex = clean.slice(4).trim()
    if (hex.length % 2 !== 0) return clean
    
    let decoded = ''
    try {
      for (let i = 0; i < hex.length / 2; i++) {
        const byte = parseInt(hex.substr(i * 2, 2), 16)
        const origCharCode = byte ^ ((SALT + i * 7) & 0xff)
        decoded += String.fromCharCode(origCharCode)
      }
      return decoded.trim().toUpperCase()
    } catch {
      return clean
    }
  }

  return clean.toUpperCase()
}
