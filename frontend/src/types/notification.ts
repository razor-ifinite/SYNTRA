export type FrequencyType = "DAILY" | "INTERVAL" | "WEEKDAYS"
export type NotificationType = "INFO" | "GOAL_DUE" | "GOAL_OVERDUE" | "MILESTONE_COMPLETED" | "MOTIVATIONAL"

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface NotificationLog {
  id: string
  goalTitle: string
  message: string
  sentAt: string
  status: "SENT" | "FAILED"
}

export interface Goal {
  id: string
  title: string
  emoji: string
  hasReminder: boolean
}

export interface ReminderConfig {
  goalId: string
  frequency: FrequencyType
  timeOfDay: string
  message: string
  enabled: boolean
}
