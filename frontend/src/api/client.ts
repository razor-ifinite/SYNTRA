import AsyncStorage from '@react-native-async-storage/async-storage'

export const SERVICES = {
  auth: 'https://syntra-auth.onrender.com',
  goal: 'https://syntra-goal.onrender.com',
  ai: 'https://syntra-ai-0km8.onrender.com',
  notification: 'https://syntra-notification.onrender.com',
}

const TOKEN_KEY = 'syntra_token'

async function getHeaders(contentType = 'application/json') {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  }
  // The user isn't sure if it's "Bearer <token>" or just the token.
  // Standard is Bearer, but we'll try just the token if it's not standard.
  // We'll use the token raw for now since the user said "i dont think so" to Bearer
  if (token) {
    headers['Authorization'] = token
  }
  return headers
}

export async function apiGet<T>(serviceUrl: string, path: string): Promise<T> {
  const headers = await getHeaders()
  const res = await fetch(`${serviceUrl}${path}`, { headers })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'API Error')
  }
  return res.json()
}

export async function apiPost<T>(serviceUrl: string, path: string, body: object): Promise<T> {
  const headers = await getHeaders()
  const res = await fetch(`${serviceUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'API Error')
  }
  return res.json()
}

export async function apiPut<T>(serviceUrl: string, path: string, body: object): Promise<T> {
  const headers = await getHeaders()
  const res = await fetch(`${serviceUrl}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'API Error')
  }
  return res.json()
}

export async function apiPatch<T>(serviceUrl: string, path: string, body?: object | string): Promise<T> {
  const isString = typeof body === 'string'
  const headers = await getHeaders(isString ? 'text/plain' : 'application/json')
  const res = await fetch(`${serviceUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: body ? (isString ? body : JSON.stringify(body)) : undefined,
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'API Error')
  }
  return res.json()
}

export async function apiDelete<T>(serviceUrl: string, path: string): Promise<T> {
  const headers = await getHeaders()
  const res = await fetch(`${serviceUrl}${path}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'API Error')
  }
  // Sometimes DELETE returns 204 No Content
  if (res.status === 204) return {} as T
  return res.json()
}
