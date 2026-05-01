const stripApiSuffix = (value: string) => value.replace(/\s+/g, '').replace(/\/api\/?$/, '')

export const getBackendApiBaseUrl = () => {
  const rawValue = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL

  if (!rawValue) {
    throw new Error('Missing API base URL. Set VITE_API_BASE_URL or VITE_API_URL in the environment.')
  }

  const candidate = rawValue.includes(',')
    ? rawValue.split(',').map(url => url.trim()).filter(Boolean).find(url => url.startsWith('http')) || rawValue.split(',')[0]
    : rawValue

  const cleanUrl = stripApiSuffix(candidate)

  if (!cleanUrl.startsWith('http')) {
    throw new Error('Invalid API base URL. Set VITE_API_BASE_URL or VITE_API_URL to a full http(s) URL.')
  }

  return cleanUrl
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
