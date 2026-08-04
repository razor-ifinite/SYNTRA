export interface AuthResponse {
  token: string
  id: string
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthError {
  field?: 'name' | 'email' | 'password' | 'general'
  message: string
}
