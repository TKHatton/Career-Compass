/**
 * Client-side encryption utilities using WebCrypto API
 * Used for encrypting redaction maps and sensitive data
 */

/**
 * Generate a random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Export key to base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

/**
 * Import key from base64 string
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0))
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(data)

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  )

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  // Return as base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  encryptedData: string,
  key: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  )

  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Encrypt a redaction map
 * Returns encrypted string suitable for storing in database
 */
export async function encryptRedactionMap(
  redactionMap: Record<string, string>
): Promise<{ encrypted: string; keyString: string }> {
  const key = await generateKey()
  const keyString = await exportKey(key)
  const mapString = JSON.stringify(redactionMap)
  const encrypted = await encrypt(mapString, key)

  return { encrypted, keyString }
}

/**
 * Decrypt a redaction map
 */
export async function decryptRedactionMap(
  encrypted: string,
  keyString: string
): Promise<Record<string, string>> {
  const key = await importKey(keyString)
  const decrypted = await decrypt(encrypted, key)
  return JSON.parse(decrypted)
}
