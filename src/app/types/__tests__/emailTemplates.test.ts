/**
 * Email Templates Types Tests
 * Day 9 - Week 2: Type Testing
 * Target: 10 tests
 */

import { describe, it, expect } from 'vitest';
import {
  getVariablesForType,
  replaceTemplateVariables,
  EmailTemplateType,
  GlobalTemplate,
  SiteTemplate,
  inviteVariables,
  orderConfirmationVariables,
} from '../emailTemplates';

describe('Email Templates Types', () => {
  describe('getVariablesForType', () => {
    it('should return invite variables', () => {
      const variables = getVariablesForType('invite');
      expect(variables).toBeDefined();
      expect(variables.length).toBeGreaterThan(0);
      // Check that the array contains an object with recipient_name key
      const hasRecipientName = variables.some(v => v.key === 'recipient_name');
      expect(hasRecipientName).toBe(true);
    });

    it('should return order confirmation variables', () => {
      const variables = getVariablesForType('order_confirmation');
      expect(variables).toBeDefined();
      expect(variables.length).toBeGreaterThan(0);
    });

    it('should return shipping notification variables', () => {
      const variables = getVariablesForType('shipping_notification');
      expect(variables).toBeDefined();
      expect(variables.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown type', () => {
      const variables = getVariablesForType('unknown' as EmailTemplateType);
      expect(variables).toEqual([]);
    });

    it('should return all template types', () => {
      const types: EmailTemplateType[] = [
        'invite',
        'order_confirmation',
        'order_cancellation',
        'gift_reminder',
        'shipping_notification',
        'gift_delivered',
        'password_reset',
        'account_created',
        'feedback_request',
        'expiration_warning',
        'thank_you',
      ];
      
      types.forEach(type => {
        const variables = getVariablesForType(type);
        if ((type as string) !== 'unknown') {
          expect(variables.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('replaceTemplateVariables', () => {
    it('should replace single variable', () => {
      const content = 'Hello {{recipient_name}}!';
      const variables = { recipient_name: 'John Doe' };
      
      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('Hello John Doe!');
    });

    it('should replace multiple variables', () => {
      const content = 'Hello {{recipient_name}}, your order {{order_id}} is confirmed.';
      const variables = {
        recipient_name: 'John Doe',
        order_id: 'ORD-123',
      };
      
      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('Hello John Doe, your order ORD-123 is confirmed.');
    });

    it('should replace repeated variables', () => {
      const content = '{{recipient_name}} and {{recipient_name}} are invited.';
      const variables = { recipient_name: 'John' };
      
      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('John and John are invited.');
    });

    it('should handle missing variables', () => {
      const content = 'Hello {{recipient_name}}!';
      const variables = {};
      
      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('Hello {{recipient_name}}!');
    });

    it('should preserve content without variables', () => {
      const content = 'Hello there!';
      const variables = { recipient_name: 'John' };
      
      const result = replaceTemplateVariables(content, variables);
      expect(result).toBe('Hello there!');
    });
  });

  describe('EmailTemplateVariable', () => {
    it('should have required properties', () => {
      inviteVariables.forEach(variable => {
        expect(variable).toHaveProperty('key');
        expect(variable).toHaveProperty('label');
        expect(variable).toHaveProperty('description');
        expect(variable).toHaveProperty('example');
      });
    });

    it('should have unique keys in invite variables', () => {
      const keys = inviteVariables.map(v => v.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });

    it('should have unique keys in order confirmation variables', () => {
      const keys = orderConfirmationVariables.map(v => v.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });
  });

  describe('GlobalTemplate Type', () => {
    it('should accept valid template object', () => {
      const template: GlobalTemplate = {
        id: 'template-1',
        type: 'invite',
        name: 'Invite Template',
        description: 'Template for invitations',
        category: 'transactional',
        defaultSubject: 'You are invited',
        defaultHtmlContent: '<html>Invite</html>',
        defaultTextContent: 'Invite text',
        variables: inviteVariables,
        isSystem: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      
      expect(template.type).toBe('invite');
      expect(template.category).toBe('transactional');
    });
  });

  describe('SiteTemplate Type', () => {
    it('should accept valid site template object', () => {
      const template: SiteTemplate = {
        id: 'template-1',
        siteId: 'site-1',
        globalTemplateId: 'global-1',
        type: 'order_confirmation',
        name: 'Order Confirmation',
        emailEnabled: true,
        subject: 'Your order is confirmed',
        htmlContent: '<html>Order confirmed</html>',
        textContent: 'Order confirmed text',
        pushEnabled: false,
        smsEnabled: false,
        enabled: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      
      expect(template.siteId).toBe('site-1');
      expect(template.emailEnabled).toBe(true);
    });

    it('should accept multi-channel configuration', () => {
      const template: SiteTemplate = {
        id: 'template-1',
        siteId: 'site-1',
        globalTemplateId: 'global-1',
        type: 'gift_reminder',
        name: 'Gift Reminder',
        emailEnabled: true,
        subject: 'Reminder',
        htmlContent: '<html>Reminder</html>',
        textContent: 'Reminder text',
        pushEnabled: true,
        pushTitle: 'Reminder',
        pushBody: 'Don\'t forget!',
        smsEnabled: true,
        smsContent: 'SMS reminder',
        enabled: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      
      expect(template.emailEnabled).toBe(true);
      expect(template.pushEnabled).toBe(true);
      expect(template.smsEnabled).toBe(true);
    });
  });
});