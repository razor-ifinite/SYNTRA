export interface AiResponse {
  content: string
  model: string
  success: boolean
}

export interface SuggestRequest {
  userContext: string
  existingGoals: string[]
  preferredStyle: 'structured' | 'flexible' | 'aggressive'
}

export interface MotivateRequest {
  goalTitle: string
  completionPercentage: number
  daysRemaining: number
}
