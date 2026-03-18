import { auth } from '../config/firebase';

function getInitials(name = '') {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'CC';
}

export function mapAuthUser(firebaseUser) {
  if (!firebaseUser) {
    return null;
  }

  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email || 'CodeCollab User',
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || null,
    role: 'student',
    initials: getInitials(firebaseUser.displayName || firebaseUser.email || 'CodeCollab User'),
  };
}

export async function getAuthToken() {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
