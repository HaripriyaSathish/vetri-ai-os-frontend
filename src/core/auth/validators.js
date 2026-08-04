export const isValidUsername = (value) => /^[A-Za-z0-9]+$/.test(value);
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isValidPassword = (value) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);