export const storage = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(key)
      return val ? JSON.parse(val) : fallback
    } catch {
      return fallback
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage error:', e)
    }
  },
  remove: (key) => localStorage.removeItem(key),
}

export const KEYS = {
  CLIENTS: 'benix_clients',
  POSTS: 'benix_posts',
  TRANSACTIONS: 'benix_transactions',
  MIND_NODES: 'benix_mind_nodes',
  MIND_CONNECTIONS: 'benix_mind_connections',
  VAULT: 'benix_vault',
  VAULT_COMMENTS: 'benix_vault_comments',
  CONTENT: 'benix_content',
  SETTINGS: 'benix_settings',
}

export const encodeB64 = (str) => btoa(unescape(encodeURIComponent(str)))
export const decodeB64 = (str) => {
  try { return decodeURIComponent(escape(atob(str))) } catch { return str }
}
