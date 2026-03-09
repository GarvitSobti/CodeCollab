// Skill proficiency scale
export const PROFICIENCY_MIN = 1;
export const PROFICIENCY_MAX = 5;

// Team size constraints
export const TEAM_SIZE_MIN = 1;
export const TEAM_SIZE_MAX = 10;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Review content limits
export const REVIEW_MIN_LENGTH = 10;
export const REVIEW_MAX_LENGTH = 1000;

// Bio limits
export const BIO_MAX_LENGTH = 500;

// Message limits
export const MESSAGE_MAX_LENGTH = 2000;

// Socket.io event names
export const SOCKET_EVENTS = {
  JOIN_TEAM: 'team:join',
  LEAVE_TEAM: 'team:leave',
  SEND_MESSAGE: 'message:send',
  NEW_MESSAGE: 'message:new',
  TYPING: 'message:typing',
  STOP_TYPING: 'message:stop-typing',
  NOTIFICATION: 'notification:new',
} as const;
