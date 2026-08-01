import toast from 'react-hot-toast';

export const clearAuthStorage = () => {
  localStorage.removeItem('teacherToken');
  localStorage.removeItem('teacherData');
  localStorage.removeItem('teacherName');
  localStorage.removeItem('studentToken');
  localStorage.removeItem('studentData');
  localStorage.removeItem('studentName');
};

export const hasActiveSession = () => Boolean(
  localStorage.getItem('teacherToken') || localStorage.getItem('studentToken')
);

export const logoutUser = (navigate, redirectTo = '/') => {
  clearAuthStorage();
  toast.success('You have been logged out.');
  navigate(redirectTo);
};

export const getFriendlyErrorMessage = (error, fallback = 'We couldn’t complete that request. Please try again.') => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const details = data?.details;

  if (details?.length) {
    return details.map((item) => `• ${item.message || item}`).join('\n');
  }

  if (status === 400) {
    return data?.message || data?.error || 'Please double-check your details and try again.';
  }

  if (status === 401) {
    if (fallback.toLowerCase().includes('sign')) {
      return 'We couldn’t sign you in. Please check your email and password and try again.';
    }
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 403) {
    return 'You don’t have permission to perform that action.';
  }

  if (status === 404) {
    return 'We couldn’t find what you were looking for.';
  }

  if (status === 409) {
    return 'That email is already in use. Please sign in or try another address.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status === 0 || !error?.response) {
    return 'We’re having trouble reach the server. Please check your connection and try again.';
  }

  return data?.message || data?.error || error?.message || fallback;
};
