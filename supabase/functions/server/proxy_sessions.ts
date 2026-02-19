/**
 * Proxy Session Management
 * Handles creation, validation, and termination of proxy login sessions
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { logAuditEvent } from './audit_log.ts';

const app = new Hono();

// Validation schemas
const createProxySessionSchema = z.object({
  employeeId: z.string().uuid(),
  siteId: z.string().uuid(),
  durationMinutes: z.number().min(1).max(60).optional().default(30),
});

/**
 * Generate a secure random token for proxy sessions
 */
function generateProxyToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * POST /proxy-sessions
 * Create a new proxy session
 */
app.post('/proxy-sessions', async (c) => {
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

    // Parse and validate request body
    const body = await c.req.json();
    const validated = createProxySessionSchema.parse(body);

    // Check if admin has proxy_login permission
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'proxy_login')
      .single();

    if (permError || !permissions) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    // Verify employee exists and belongs to the site
    const { data: employee, error: empError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', validated.employeeId)
      .single();

    if (empError || !employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Generate secure token
    const token = generateProxyToken();
    const expiresAt = new Date(Date.now() + validated.durationMinutes * 60 * 1000);

    // Create proxy session
    const { data: session, error: sessionError } = await supabase
      .from('proxy_sessions')
      .insert({
        admin_id: user.id,
        employee_id: validated.employeeId,
        site_id: validated.siteId,
        token,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create proxy session:', sessionError);
      return c.json({ error: 'Failed to create proxy session' }, 500);
    }

    // Log audit event
    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'proxy_login_start',
      resourceType: 'proxy_session',
      resourceId: session.id,
      metadata: {
        employeeId: validated.employeeId,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        siteId: validated.siteId,
        durationMinutes: validated.durationMinutes,
      },
    });

    return c.json({
      id: session.id,
      token: session.token,
      employeeId: session.employee_id,
      expiresAt: session.expires_at,
      employee: {
        id: employee.id,
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
      },
    }, 201);
  } catch (error) {
    console.error('Error creating proxy session:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /proxy-sessions/:sessionId
 * Get proxy session details
 */
app.get('/proxy-sessions/:sessionId', async (c) => {
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

    const sessionId = c.req.param('sessionId');

    const { data: session, error } = await supabase
      .from('proxy_sessions')
      .select(`
        *,
        employee:users!employee_id(id, email, first_name, last_name)
      `)
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Check if session is expired
    const isExpired = new Date(session.expires_at) < new Date();
    if (isExpired || !session.is_active) {
      return c.json({ error: 'Session expired or inactive' }, 410);
    }

    return c.json({
      id: session.id,
      adminId: session.admin_id,
      employeeId: session.employee_id,
      siteId: session.site_id,
      expiresAt: session.expires_at,
      createdAt: session.created_at,
      employee: session.employee,
    });
  } catch (error) {
    console.error('Error fetching proxy session:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * DELETE /proxy-sessions/:sessionId
 * End a proxy session
 */
app.delete('/proxy-sessions/:sessionId', async (c) => {
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

    const sessionId = c.req.param('sessionId');

    // Get session to verify ownership
    const { data: session, error: fetchError } = await supabase
      .from('proxy_sessions')
      .select('admin_id, employee_id, site_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Verify user is the admin who created the session
    if (session.admin_id !== user.id) {
      return c.json({ error: 'Unauthorized to end this session' }, 403);
    }

    // End the session
    const { error: updateError } = await supabase
      .from('proxy_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to end proxy session:', updateError);
      return c.json({ error: 'Failed to end session' }, 500);
    }

    // Log audit event
    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'proxy_login_end',
      resourceType: 'proxy_session',
      resourceId: sessionId,
      metadata: {
        employeeId: session.employee_id,
        siteId: session.site_id,
      },
    });

    return c.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error ending proxy session:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /proxy-sessions/current
 * Get current active proxy session for the user
 */
app.get('/proxy-sessions/current', async (c) => {
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

    // Find active proxy session for this admin
    const { data: session, error } = await supabase
      .from('proxy_sessions')
      .select(`
        *,
        employee:users!employee_id(id, email, first_name, last_name)
      `)
      .eq('admin_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !session) {
      return c.json({ session: null });
    }

    return c.json({
      session: {
        id: session.id,
        employeeId: session.employee_id,
        siteId: session.site_id,
        expiresAt: session.expires_at,
        employee: session.employee,
      },
    });
  } catch (error) {
    console.error('Error fetching current proxy session:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
