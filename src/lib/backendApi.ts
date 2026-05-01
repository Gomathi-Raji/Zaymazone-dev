const stripApiSuffix = (value: string) => value.replace(/\s+/g, '').replace(/\/api\/?$/, '')

export const getBackendApiBaseUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL

  if (apiUrl && typeof apiUrl === 'string') {
    if (apiUrl.includes(',')) {
      const urls = apiUrl.split(',').map(url => url.trim()).filter(Boolean)
      apiUrl = urls.find(url => url.startsWith('http')) || urls[0]
    }

    if (apiUrl) {
      const cleanUrl = stripApiSuffix(apiUrl)
      // Check if this is localhost and we're in production
      const isLocalhostUrl = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      const isProduction = !currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')
      
      if (isLocalhostUrl && isProduction) {
        console.warn('Localhost URL in production, falling back to Render backend')
      } else {
        return cleanUrl
      }
    }
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:4000'
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:4000'
    }
  }

  return 'https://zaymazone-dev-backend.onrender.com'
}

export const buildBackendApiUrl = (path: string) => {
  if (path.startsWith('http')) return path

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${getBackendApiBaseUrl()}${cleanPath}`
}

export const getBackendAuthToken = () => {
  try {
    return localStorage.getItem('admin_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('firebase_id_token') ||
      localStorage.getItem('token') ||
      ''
  } catch {
    return ''
  }
}
