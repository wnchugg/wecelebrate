/**
 * Password Validation Utilities
 * Client-side password validation (server-side validation is authoritative)
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number; // 0-100
}

/**
 * Validate password complexity
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 20;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  // Special character check
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 15;
  }

  // Check for common patterns
  const commonPatterns = [
    /^password/i,
    /^admin/i,
    /^welcome/i,
    /^qwerty/i,
    /123456/,
    /^abc/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns. Please choose a more unique password');
      score -= 20;
      break;
    }
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
    score -= 10;
  }

  // Check for sequential characters
  if (/abc|bcd|cde|def|123|234|345|456/i.test(password)) {
    errors.push('Password contains sequential characters');
    score -= 10;
  }

  // Bonus for variety
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 60) {
    strength = 'fair';
  } else if (score < 80) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + special;

  // Ensure at least one character from each category
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: 'weak' | 'fair' | 'good' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'fair':
      return 'text-orange-600';
    case 'good':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
  }
}

/**
 * Get password strength background color for progress bar
 */
export function getPasswordStrengthBgColor(strength: 'weak' | 'fair' | 'good' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-orange-500';
    case 'good':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
  }
}
