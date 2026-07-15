export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type MilestoneStatus = 'PENDING' | 'COMPLETED';
export type FrequencyType = 'DAILY' | 'INTERVAL' | 'WEEKDAYS';
export type NotificationLogStatus = 'SENT' | 'FAILED';

export interface UserProfile { id: string; name: string; email: string; }

export interface Milestone {
  id: string; goalId: string; title: string;
  dueDate: string; status: MilestoneStatus; createdAt: string;
}

export interface Goal {
  id: string; userId: string; title: string; description?: string;
  deadline: string; status: GoalStatus; createdAt: string;
  milestones?: Milestone[];
}

export interface GoalProgressResponse {
  goal: Goal; milestones: Milestone[]; completionPercentage: number;
}

export interface NotificationLog {
  id: string; userId: string; goalId: string;
  message: string; sentAt: string; status: NotificationLogStatus;
}

export interface NotificationConfig {
  goalId: string; frequency: FrequencyType;
  timeOfDay: string; message: string;
}

export interface OptionAnalysis {
  optionTitle: string; pros: string[]; cons: string[];
  risks: string[]; opportunityScore: number;
}

export interface DecisionResult { scenario: string; options: OptionAnalysis[]; }

export interface FutureMeInput {
  gpa: number; studyHoursPerDay: number;
  attendancePercentage: number; savingsTarget: number;
}

export interface FutureMeResult {
  projectedGrowth: { semester: string; score: number }[];
  roadmap: string;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface AuthResponse { token: string; userId: string; name: string; email: string; }
export interface CreateGoalPayload { userId: string; title: string; description?: string; deadline: string; }
export interface CreateMilestonePayload { goalId: string; title: string; dueDate: string; }
