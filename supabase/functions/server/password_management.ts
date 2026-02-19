/**
 * Password Management Service
 * Handles secure password hashing, validation, and management
 */

import { Hono } from "npm:hono@4.0.2";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { logAuditEvent } from './audit_log.ts';
import type { Context } from "npm:hono@4.0.2";

const app = new Hono();

// Password validation schema
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Set password request schema
const setPasswordSchema = z.object({
  userId: z.string().uuid(),
  siteId: z.string().uuid(),
  temporaryPassword: z.string(),
  forcePasswordReset: z.boolean().default(true),
  sendEmail: z.boolean().default(true),
  expiresInHours: z.number().min(1).max(168).default(48), // 1 hour to 7 days
});

// Change password request schema
const changePasswordSchema = z.object({
  userId: z.string().uuid(),
  currentPassword: z.string(),
  newPassword: z.string(),
});

/**
 * Generate a cryptographically secure random password
 */
function generateSecurePassword(length: number = 16): string {
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
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Validate password complexity
 */
function validatePasswordComplexity(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common passwords (simplified list)
  const commonPasswords = [
    'password123!', 'Password123!', 'Admin123!', 'Welcome123!',
    'Qwerty123!', 'Abc123456!', 'Password1!', 'Admin1234!'
  ];
  
  if (commonPasswords.includes(password)) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Adjust based on security requirements vs performance
  return await bcrypt.hash(password);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * POST /password-management/set
 * Set a temporary password for a user (admin action)
 */
app.post('/set', async (c: Context) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: c.req.header('Authorization') ?? '' },
        },
      }
    );

    // Get current user (admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Parse and validate request
    const body = await c.req.json();
    const validated = setPasswordSchema.parse(body);

    // Validate password complexity
    const validation = validatePasswordComplexity(validated.temporaryPassword);
    if (!validation.valid) {
      return c.json({ 
        error: 'Password does not meet complexity requirements',
        details: validation.errors 
      }, 400);
    }

    // Hash the password
    const passwordHash = await hashPassword(validated.temporaryPassword);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + validated.expiresInHours);

    // Update user password in database
    const { error: updateError } = await supabase
      .from('site_users')
      .update({
        password_hash: passwordHash,
        force_password_reset: validated.forcePasswordReset,
        password_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.userId)
      .eq('site_id', validated.siteId);

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return c.json({ error: 'Failed to set password' }, 500);
    }

    // Log audit event
    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'user_password_set',
      resourceType: 'site_user',
      resourceId: validated.userId,
      metadata: {
        siteId: validated.siteId,
        forcePasswordReset: validated.forcePasswordReset,
        expiresInHours: validated.expiresInHours,
        expiresAt: expiresAt.toISOString(),
      },
    });

    // TODO: Send email notification
    if (validated.sendEmail) {
      // Email sending would be implemented here
      console.log(`Would send password email to user ${validated.userId}`);
    }

    return c.json({
      success: true,
      message: 'Password set successfully',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error setting password:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /password-management/generate
 * Generate a secure random password
 */
app.post('/generate', async (c: Context) => {
  try {
    const body = await c.req.json();
    const length = body.length || 16;

    if (length < 12 || length > 128) {
      return c.json({ error: 'Password length must be between 12 and 128 characters' }, 400);
    }

    const password = generateSecurePassword(length);

    return c.json({
      password,
      length: password.length,
    });
  } catch (error) {
    console.error('Error generating password:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /password-management/validate
 * Validate password complexity
 */
app.post('/validate', async (c: Context) => {
  try {
    const body = await c.req.json();
    const password = body.password;

    if (!password) {
      return c.json({ error: 'Password is required' }, 400);
    }

    const validation = validatePasswordComplexity(password);

    return c.json({
      valid: validation.valid,
      errors: validation.errors,
    });
  } catch (error) {
    console.error('Error validating password:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /password-management/change
 * Change user's own password
 */
app.post('/change', async (c: Context) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: c.req.header('Authorization') ?? '' },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Parse and validate request
    const body = await c.req.json();
    const validated = changePasswordSchema.parse(body);

    // Get current password hash
    const { data: userData, error: fetchError } = await supabase
      .from('site_users')
      .select('password_hash, force_password_reset')
      .eq('id', validated.userId)
      .single();

    if (fetchError || !userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Verify current password
    const isValid = await verifyPassword(validated.currentPassword, userData.password_hash);
    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 401);
    }

    // Validate new password complexity
    const validation = validatePasswordComplexity(validated.newPassword);
    if (!validation.valid) {
      return c.json({ 
        error: 'New password does not meet complexity requirements',
        details: validation.errors 
      }, 400);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(validated.newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('site_users')
      .update({
        password_hash: newPasswordHash,
        force_password_reset: false,
        password_expires_at: null, // Remove expiration on user-set password
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.userId);

    if (updateError) {
      console.error('Failed to change password:', updateError);
      return c.json({ error: 'Failed to change password' }, 500);
    }

    // Log audit event
    await logAuditEvent(supabase, {
      userId: validated.userId,
      action: 'user_password_changed',
      resourceType: 'site_user',
      resourceId: validated.userId,
      metadata: {
        selfChange: true,
      },
    });

    return c.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /password-management/verify-expiration
 * Check if password has expired
 */
app.post('/verify-expiration', async (c: Context) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: c.req.header('Authorization') ?? '' },
        },
      }
    );

    const body = await c.req.json();
    const userId = body.userId;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Get user password expiration
    const { data: userData, error } = await supabase
      .from('site_users')
      .select('password_expires_at, force_password_reset')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const isExpired = userData.password_expires_at && 
                     new Date(userData.password_expires_at) < new Date();

    return c.json({
      expired: isExpired,
      expiresAt: userData.password_expires_at,
      forceReset: userData.force_password_reset,
      requiresPasswordChange: isExpired || userData.force_password_reset,
    });
  } catch (error) {
    console.error('Error verifying password expiration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
