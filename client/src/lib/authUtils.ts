export function isUnauthorizedError(error: Error): boolean {
  // Check for 401 status code in error message
  return /^401:/.test(error.message);
}

export function isForbiddenError(error: Error): boolean {
  // Check for 403 status code in error message  
  return /^403:/.test(error.message);
}
