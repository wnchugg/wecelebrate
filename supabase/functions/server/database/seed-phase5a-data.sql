-- ============================================================================
-- Seed Data for Phase 5A Tables
-- Purpose: Add sample data for brands, email templates, and site gift configs
-- Date: February 16, 2026
-- ============================================================================

-- ==================== BRANDS ====================

INSERT INTO brands (id, name, description, logo_url, primary_color, secondary_color, status, settings) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'WeCelebrate',
    'Default WeCelebrate brand for corporate gifting',
    'https://example.com/logos/wecelebrate.png',
    '#4F46E5',
    '#818CF8',
    'active',
    '{"theme": "modern", "font": "Inter"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Premium Corporate',
    'Premium brand for high-end corporate clients',
    'https://example.com/logos/premium.png',
    '#1E40AF',
    '#3B82F6',
    'active',
    '{"theme": "elegant", "font": "Playfair Display"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Tech Startup',
    'Modern brand for tech companies',
    'https://example.com/logos/tech.png',
    '#10B981',
    '#34D399',
    'active',
    '{"theme": "tech", "font": "Roboto"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ==================== EMAIL TEMPLATES ====================

-- Global Templates
INSERT INTO email_templates (
  id, name, description, template_type, event_type, subject, body_html, body_text,
  variables, from_name, from_email, status, is_default
) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Order Confirmation - Default',
    'Default order confirmation email template',
    'global',
    'order_confirmation',
    'Your Order Confirmation - {{orderNumber}}',
    '<html><body><h1>Thank you for your order!</h1><p>Hi {{userName}},</p><p>Your order <strong>{{orderNumber}}</strong> has been confirmed.</p><p><strong>Gift:</strong> {{giftName}}</p><p><strong>Total:</strong> {{orderTotal}}</p><p>We''ll send you a shipping notification once your gift is on its way.</p><p>Best regards,<br>{{companyName}}</p></body></html>',
    'Thank you for your order!\n\nHi {{userName}},\n\nYour order {{orderNumber}} has been confirmed.\n\nGift: {{giftName}}\nTotal: {{orderTotal}}\n\nWe''ll send you a shipping notification once your gift is on its way.\n\nBest regards,\n{{companyName}}',
    '["userName", "orderNumber", "giftName", "orderTotal", "companyName"]'::jsonb,
    'WeCelebrate',
    'noreply@wecelebrate.com',
    'active',
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'Shipping Notification - Default',
    'Default shipping notification email template',
    'global',
    'shipping_notification',
    'Your Gift is On Its Way! - {{orderNumber}}',
    '<html><body><h1>Your gift has shipped!</h1><p>Hi {{userName}},</p><p>Great news! Your order <strong>{{orderNumber}}</strong> has been shipped.</p><p><strong>Gift:</strong> {{giftName}}</p><p><strong>Tracking Number:</strong> {{trackingNumber}}</p><p>You can track your package using the tracking number above.</p><p>Best regards,<br>{{companyName}}</p></body></html>',
    'Your gift has shipped!\n\nHi {{userName}},\n\nGreat news! Your order {{orderNumber}} has been shipped.\n\nGift: {{giftName}}\nTracking Number: {{trackingNumber}}\n\nYou can track your package using the tracking number above.\n\nBest regards,\n{{companyName}}',
    '["userName", "orderNumber", "giftName", "trackingNumber", "companyName"]'::jsonb,
    'WeCelebrate',
    'noreply@wecelebrate.com',
    'active',
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'Delivery Confirmation - Default',
    'Default delivery confirmation email template',
    'global',
    'delivery_confirmation',
    'Your Gift Has Been Delivered! - {{orderNumber}}',
    '<html><body><h1>Your gift has been delivered!</h1><p>Hi {{userName}},</p><p>Your gift <strong>{{giftName}}</strong> has been successfully delivered.</p><p>We hope you enjoy it!</p><p>Best regards,<br>{{companyName}}</p></body></html>',
    'Your gift has been delivered!\n\nHi {{userName}},\n\nYour gift {{giftName}} has been successfully delivered.\n\nWe hope you enjoy it!\n\nBest regards,\n{{companyName}}',
    '["userName", "giftName", "companyName"]'::jsonb,
    'WeCelebrate',
    'noreply@wecelebrate.com',
    'active',
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    'Employee Welcome - Default',
    'Default employee welcome email template',
    'global',
    'employee_added',
    'Welcome to {{companyName}} Gift Portal!',
    '<html><body><h1>Welcome!</h1><p>Hi {{employeeName}},</p><p>You''ve been added to the {{companyName}} gift portal.</p><p>Your access code: <strong>{{serialCode}}</strong></p><p>Visit <a href="{{siteUrl}}">{{siteUrl}}</a> to select your gift.</p><p>Best regards,<br>{{companyName}}</p></body></html>',
    'Welcome!\n\nHi {{employeeName}},\n\nYou''ve been added to the {{companyName}} gift portal.\n\nYour access code: {{serialCode}}\n\nVisit {{siteUrl}} to select your gift.\n\nBest regards,\n{{companyName}}',
    '["employeeName", "companyName", "serialCode", "siteUrl"]'::jsonb,
    'WeCelebrate',
    'noreply@wecelebrate.com',
    'active',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ==================== SITE GIFT CONFIGS ====================

-- Note: Site gift configs are created per-site, so we'll create a few examples
-- These will need actual site IDs from your sites table

-- Example: Create default configs for first 3 sites (if they exist)
DO $$
DECLARE
  site_record RECORD;
  config_count INTEGER := 0;
BEGIN
  FOR site_record IN 
    SELECT id FROM sites WHERE status = 'active' LIMIT 3
  LOOP
    -- Create a default "all gifts" configuration
    INSERT INTO site_gift_configs (
      site_id,
      assignment_strategy,
      selected_product_ids,
      excluded_product_ids,
      included_categories,
      excluded_categories,
      min_price,
      max_price,
      filters
    ) VALUES (
      site_record.id,
      'all',
      '[]'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb,
      NULL,
      NULL,
      '{}'::jsonb
    )
    ON CONFLICT (site_id) DO NOTHING;
    
    config_count := config_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Created % site gift configurations', config_count;
END $$;

-- ==================== SUMMARY ====================

DO $$
DECLARE
  brand_count INTEGER;
  template_count INTEGER;
  config_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO brand_count FROM brands;
  SELECT COUNT(*) INTO template_count FROM email_templates;
  SELECT COUNT(*) INTO config_count FROM site_gift_configs;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Phase 5A Seed Data Summary';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Brands: %', brand_count;
  RAISE NOTICE 'Email Templates: %', template_count;
  RAISE NOTICE 'Site Gift Configs: %', config_count;
  RAISE NOTICE '===========================================';
END $$;
