/**
 * Input sanitization utilities to protect against SQL injection and XSS.
 * Note: Supabase uses parameterized queries, so SQL injection is already prevented at the DB level.
 * These utilities add an extra layer for:
 * - XSS prevention (HTML/script injection)
 * - Input validation and length limits
 * - Dangerous character stripping for display
 */

// Dangerous patterns that could indicate injection attempts - only target actual dangerous patterns
const SQL_PATTERNS = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b.*?(;))|(--)|(\/\*)|(\*\/)|(;)/gi;

// HTML/script injection patterns - only target dangerous patterns, not normal text
const XSS_PATTERNS = /<script[^>]*>.*?<\/script>/gi;

/**
 * Sanitize string input - removes dangerous characters and patterns
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input
    .slice(0, maxLength)
    .replace(/\0/g, '') // Remove null bytes
    .replace(XSS_PATTERNS, '')
    .trim();
  
  return sanitized;
}

/**
 * Sanitize for database storage - strips SQL-like patterns (extra safety layer)
 */
export function sanitizeForDb(input: string, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  
  return sanitizeString(input, maxLength)
    .replace(SQL_PATTERNS, '');
}

/**
 * Sanitize email - basic validation
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email
    .toLowerCase()
    .trim()
    .slice(0, 255)
    .replace(/[^\w.@+-]/g, '');
}

/**
 * Sanitize number - ensure it's a valid number
 */
export function sanitizeNumber(input: unknown, defaultValue = 0): number {
  if (typeof input === 'number' && !isNaN(input)) return input;
  if (typeof input === 'string') {
    const num = parseFloat(input);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

/**
 * Sanitize object for database insert/update
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  stringFields: (keyof T)[],
  maxLength = 1000
): T {
  const result = { ...obj };
  
  for (const key of stringFields) {
    if (typeof result[key] === 'string') {
      (result as Record<string, unknown>)[key as string] = sanitizeForDb(
        result[key] as string,
        maxLength
      );
    }
  }
  
  return result;
}
