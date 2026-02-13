/**
 * Email Templates Tests
 * Day 7 - Week 2: Business Logic Utils Testing
 * Target: 20 tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateConfirmationEmail,
  generateReminderEmail,
  generateShippingNotificationEmail,
} from '../emailTemplates';
import type { OrderTracking } from '../../data/mockGiftFlow';

describe('Email Templates', () => {
  const mockShippingAddress = {
    fullName: 'John Doe',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    phone: '555-0123',
  };

  const mockOrderTracking: OrderTracking = {
    orderId: 'order-123',
    orderNumber: 'ORD-2026-001',
    status: 'shipped',
    trackingNumber: 'TRACK123456',
    carrier: 'UPS',
    estimatedDelivery: 'February 20, 2026',
    quantity: 1,
    shippingAddress: mockShippingAddress,
    orderDate: '2026-02-10T00:00:00Z',
    timeline: [],
    gift: {
      id: 'gift-1',
      name: 'Premium Headphones',
      description: 'High-quality wireless headphones',
      longDescription: 'Premium high-quality wireless headphones with noise cancellation',
      image: 'https://example.com/headphones.jpg',
      category: 'Electronics',
      value: 299.99,
      features: ['Wireless', 'Noise-cancelling'],
      specifications: {
        battery: '30 hours',
        weight: '250g',
      },
      inStock: true,
      availableQuantity: 10,
    },
  };

  describe('generateConfirmationEmail', () => {
    it('should generate complete email template', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        2,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email).toHaveProperty('subject');
      expect(email).toHaveProperty('html');
      expect(email).toHaveProperty('text');
    });

    it('should include order number in subject', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.subject).toContain('ORD-2026-001');
    });

    it('should include customer name in HTML', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('John Doe');
    });

    it('should include customer name in text version', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.text).toContain('John Doe');
    });

    it('should include gift name in template', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('Premium Headphones');
      expect(email.text).toContain('Premium Headphones');
    });

    it('should include gift image URL', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('https://example.com/headphones.jpg');
    });

    it('should include quantity', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        3,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('Quantity: 3');
      expect(email.text).toContain('Quantity: 3');
    });

    it('should include complete shipping address', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('123 Main St');
      expect(email.html).toContain('San Francisco');
      expect(email.html).toContain('CA');
      expect(email.html).toContain('94102');
      expect(email.html).toContain('USA');
    });

    it('should include estimated delivery date', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('February 20, 2026');
      expect(email.text).toContain('February 20, 2026');
    });

    it('should include order ID', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('order-123');
      expect(email.text).toContain('order-123');
    });

    it('should have valid HTML structure', () => {
      const email = generateConfirmationEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('<!DOCTYPE html>');
      expect(email.html).toContain('<html>');
      expect(email.html).toContain('</html>');
    });
  });

  describe('generateReminderEmail', () => {
    it('should generate complete email template', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        2,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email).toHaveProperty('subject');
      expect(email).toHaveProperty('html');
      expect(email).toHaveProperty('text');
    });

    it('should include order number in subject', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.subject).toContain('ORD-2026-001');
    });

    it('should include customer name in HTML', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('John Doe');
    });

    it('should include customer name in text version', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.text).toContain('John Doe');
    });

    it('should include gift name in template', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('Premium Headphones');
      expect(email.text).toContain('Premium Headphones');
    });

    it('should include gift image URL', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('https://example.com/headphones.jpg');
    });

    it('should include quantity', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        3,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('Quantity: 3');
      expect(email.text).toContain('Quantity: 3');
    });

    it('should include complete shipping address', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('123 Main St');
      expect(email.html).toContain('San Francisco');
      expect(email.html).toContain('CA');
      expect(email.html).toContain('94102');
      expect(email.html).toContain('USA');
    });

    it('should include estimated delivery date', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('February 20, 2026');
      expect(email.text).toContain('February 20, 2026');
    });

    it('should include order ID', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('order-123');
      expect(email.text).toContain('order-123');
    });

    it('should have valid HTML structure', () => {
      const email = generateReminderEmail(
        'ORD-2026-001',
        'order-123',
        'John Doe',
        'john@example.com',
        'Premium Headphones',
        'https://example.com/headphones.jpg',
        1,
        mockShippingAddress,
        'February 20, 2026'
      );

      expect(email.html).toContain('<!DOCTYPE html>');
      expect(email.html).toContain('<html>');
      expect(email.html).toContain('</html>');
    });
  });

  describe('generateShippingNotificationEmail', () => {
    it('should generate complete email template', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email).toHaveProperty('subject');
      expect(email).toHaveProperty('html');
      expect(email).toHaveProperty('text');
    });

    it('should include order number in subject', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.subject).toContain('ORD-2026-001');
    });

    it('should include tracking number', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('TRACK123456');
      expect(email.text).toContain('TRACK123456');
    });

    it('should include carrier name', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('UPS');
      expect(email.text).toContain('UPS');
    });

    it('should handle missing tracking number', () => {
      const tracking = { ...mockOrderTracking, trackingNumber: undefined as string | undefined };
      const email = generateShippingNotificationEmail(
        tracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('N/A');
    });

    it('should handle missing carrier', () => {
      const tracking = { ...mockOrderTracking, carrier: undefined as string | undefined };
      const email = generateShippingNotificationEmail(
        tracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('N/A');
    });

    it('should include gift details', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('Premium Headphones');
      expect(email.html).toContain('https://example.com/headphones.jpg');
    });

    it('should include estimated delivery', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('February 20, 2026');
      expect(email.text).toContain('February 20, 2026');
    });

    it('should include customer name', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'Jane Smith',
        'jane@example.com'
      );

      expect(email.html).toContain('Jane Smith');
      expect(email.text).toContain('Jane Smith');
    });

    it('should have valid HTML structure', () => {
      const email = generateShippingNotificationEmail(
        mockOrderTracking,
        'John Doe',
        'john@example.com'
      );

      expect(email.html).toContain('<!DOCTYPE html>');
      expect(email.html).toContain('<html>');
      expect(email.html).toContain('</html>');
    });
  });

  describe('Email Template Structure', () => {
    it('should return consistent interface for all templates', () => {
      const templates = [
        generateConfirmationEmail(
          'ORD-001', 'order-1', 'John', 'john@test.com',
          'Gift', 'image.jpg', 1, mockShippingAddress, 'Feb 20'
        ),
        generateReminderEmail(
          'ORD-001', 'order-1', 'John', 'john@test.com',
          'Gift', 'image.jpg', 1, mockShippingAddress, 'Feb 20'
        ),
        generateShippingNotificationEmail(
          mockOrderTracking, 'John', 'john@test.com'
        ),
      ];

      templates.forEach(template => {
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('html');
        expect(template).toHaveProperty('text');
        expect(typeof template.subject).toBe('string');
        expect(typeof template.html).toBe('string');
        expect(typeof template.text).toBe('string');
      });
    });

    it('should have non-empty content', () => {
      const email = generateConfirmationEmail(
        'ORD-001', 'order-1', 'John', 'john@test.com',
        'Gift', 'image.jpg', 1, mockShippingAddress, 'Feb 20'
      );

      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.html.length).toBeGreaterThan(0);
      expect(email.text.length).toBeGreaterThan(0);
    });

    it('should have copyright in footer', () => {
      const templates = [
        generateConfirmationEmail(
          'ORD-001', 'order-1', 'John', 'john@test.com',
          'Gift', 'image.jpg', 1, mockShippingAddress, 'Feb 20'
        ),
        generateReminderEmail(
          'ORD-001', 'order-1', 'John', 'john@test.com',
          'Gift', 'image.jpg', 1, mockShippingAddress, 'Feb 20'
        ),
        generateShippingNotificationEmail(
          mockOrderTracking, 'John', 'john@test.com'
        ),
      ];

      templates.forEach(template => {
        expect(template.html).toContain('© 2026');
        expect(template.text).toContain('© 2026');
      });
    });
  });
});