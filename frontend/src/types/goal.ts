export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED'
export type MilestoneStatus = 'PENDING' | 'COMPLETED'

export interface GoalResponse {
  id: string
  userId: string
  title: string
  description: string
  deadline: string
  status: GoalStatus
  createdAt: string
}

export interface MilestoneResponse {
  id: string
  goalId: string
  title: string
  dueDate: string
  status: MilestoneStatus
  createdAt: string
}

export interface GoalProgressResponse {
  goal: GoalResponse
  milestones: MilestoneResponse[]
  completionPercentage: number
}

export interface GoalRequest {
  title: string
  description: string
  deadline: string
  userId: string
}

export interface MilestoneRequest {
  title: string
  dueDate: string
  goalId: string
}
