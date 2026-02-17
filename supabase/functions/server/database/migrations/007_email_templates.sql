-- ============================================================================
-- Migration 007: Email Templates Table
-- Purpose: Add email templates table for email template management
-- Date: February 16, 2026
-- ============================================================================

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys (nullable for global templates)
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Template Information
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL,  -- global, site, client
  event_type TEXT NOT NULL,  -- order_confirmation, shipping_notification, etc.
  
  -- Template Content
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Template Variables (JSONB array of variable names)
  variables JSONB DEFAULT '[]',
  
  -- Settings
  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT email_templates_type_check CHECK (template_type IN ('global', 'site', 'client')),
  CONSTRAINT email_templates_status_check CHECK (status IN ('active', 'inactive', 'draft')),
  CONSTRAINT email_templates_name_length CHECK (length(name) >= 2),
  CONSTRAINT email_templates_subject_length CHECK (length(subject) >= 1),
  CONSTRAINT email_templates_scope_check CHECK (
    (template_type = 'global' AND site_id IS NULL AND client_id IS NULL) OR
    (template_type = 'site' AND site_id IS NOT NULL) OR
    (template_type = 'client' AND client_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_site_id ON email_templates(site_id) WHERE site_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_templates_client_id ON email_templates(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_event_type ON email_templates(event_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_status ON email_templates(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_default ON email_templates(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_email_templates_site_event ON email_templates(site_id, event_type) WHERE site_id IS NOT NULL;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE email_templates IS 'Email templates for automated emails';
COMMENT ON COLUMN email_templates.template_type IS 'Scope of template: global, site, or client';
COMMENT ON COLUMN email_templates.event_type IS 'Event that triggers this template: order_confirmation, shipping_notification, etc.';
COMMENT ON COLUMN email_templates.variables IS 'Array of variable names used in the template';
COMMENT ON COLUMN email_templates.is_default IS 'Whether this is the default template for the event type';

-- Update schema version
INSERT INTO schema_versions (version, description) VALUES 
  (7, 'Added email_templates table for email template management')
ON CONFLICT (version) DO NOTHING;
