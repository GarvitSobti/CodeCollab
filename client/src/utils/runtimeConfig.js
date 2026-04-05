const LOCAL_API_ORIGIN = 'http://localhost:3003';

export function getApiOrigin() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return LOCAL_API_ORIGIN;
}

export function getSocketOrigin() {
  return process.env.REACT_APP_SOCKET_URL || getApiOrigin();
}

export function isRealtimeEnabled() {
  if (process.env.REACT_APP_ENABLE_REALTIME === 'true') {
    return true;
  }

  if (process.env.REACT_APP_ENABLE_REALTIME === 'false') {
    return false;
  }

  if (typeof window === 'undefined') {
    return true;
  }

  return !window.location.hostname.endsWith('.vercel.app');
}
