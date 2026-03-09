// ─── Enums (mirroring Prisma schema) ────────────────────────

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SkillCategory = 'FRONTEND' | 'BACKEND' | 'MOBILE' | 'DATA' | 'DEVOPS' | 'DESIGN' | 'OTHER';
export type TeamStatus = 'FORMING' | 'COMPLETE' | 'COMPETING' | 'FINISHED';
export type TeamRole = 'LEADER' | 'MEMBER';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type ReviewRating = 'POSITIVE' | 'NEGATIVE';
export type MessageType = 'TEXT' | 'SYSTEM';
export type NotificationType = 'TEAM_INVITE' | 'HACKATHON_ALERT' | 'REVIEW_RECEIVED' | 'TEAM_UPDATE' | 'SYSTEM';
export type LookingFor = 'LEARN' | 'COMPETE' | 'NETWORK';

// ─── API Response Types ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── User Types ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  university?: string;
  graduationYear?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  experienceLevel: ExperienceLevel;
  skills: UserSkillInfo[];
  positiveReviewCount: number;
  negativeReviewCount: number;
}

export interface UserSkillInfo {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  proficiencyLevel: number;
}

export interface UserPreferences {
  preferredExperienceLevels: ExperienceLevel[];
  preferredSkillCategories: SkillCategory[];
  preferredTeamSize?: number;
  lookingFor: LookingFor[];
}

// ─── Hackathon Types ────────────────────────────────────────

export interface HackathonSummary {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  location?: string;
  isOnline: boolean;
  difficultyLevel: ExperienceLevel;
  tags: string[];
  interestedCount: number;
  isUserInterested: boolean;
}

// ─── Team Types ─────────────────────────────────────────────

export interface TeamSummary {
  id: string;
  name: string;
  hackathonName: string;
  status: TeamStatus;
  memberCount: number;
  maxTeamSize: number;
}

export interface TeamInviteInfo {
  id: string;
  teamName: string;
  hackathonName: string;
  fromUserName: string;
  message?: string;
  status: InviteStatus;
  createdAt: string;
}

// ─── Review Types ───────────────────────────────────────────

export interface ReviewInfo {
  id: string;
  authorName?: string; // null if anonymous
  hackathonName: string;
  rating: ReviewRating;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

// ─── Chat Types ─────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  createdAt: string;
}

// ─── Matching Types ─────────────────────────────────────────

export interface RecommendedUser {
  user: UserProfile;
  matchScore: number;
  matchReasons: string[];
}
