/**
 * Celebration Types Tests
 * Day 9 - Week 2: Type Testing
 * Target: 12 tests
 */

import { describe, it, expect } from 'vitest';
import {
  ECardTemplate,
  CelebrationMessage,
  ECARD_TEMPLATES,
} from '../celebration';

describe('Celebration Types', () => {
  describe('ECARD_TEMPLATES', () => {
    it('should export ecard templates array', () => {
      expect(ECARD_TEMPLATES).toBeDefined();
      expect(Array.isArray(ECARD_TEMPLATES)).toBe(true);
      expect(ECARD_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('should have valid template structure', () => {
      ECARD_TEMPLATES.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('backgroundColor');
        expect(template).toHaveProperty('accentColor');
        expect(template).toHaveProperty('textColor');
        expect(template).toHaveProperty('design');
      });
    });

    it('should have unique template IDs', () => {
      const ids = ECARD_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should include anniversary templates', () => {
      const anniversaryTemplates = ECARD_TEMPLATES.filter(
        t => t.category === 'anniversary'
      );
      expect(anniversaryTemplates.length).toBeGreaterThan(0);
    });

    it('should include thank-you templates', () => {
      const thankYouTemplates = ECARD_TEMPLATES.filter(
        t => t.category === 'thank-you'
      );
      expect(thankYouTemplates.length).toBeGreaterThan(0);
    });

    it('should include congratulations templates', () => {
      const congratsTemplates = ECARD_TEMPLATES.filter(
        t => t.category === 'congratulations'
      );
      expect(congratsTemplates.length).toBeGreaterThan(0);
    });

    it('should have valid color formats', () => {
      ECARD_TEMPLATES.forEach(template => {
        // Check if colors start with #
        expect(template.backgroundColor).toMatch(/^#/);
        expect(template.accentColor).toMatch(/^#/);
        expect(template.textColor).toMatch(/^#/);
      });
    });

    it('should have valid design types', () => {
      const validDesigns = ['confetti', 'balloons', 'stars', 'gradient', 'pattern', 'minimal', 'floral'];
      
      ECARD_TEMPLATES.forEach(template => {
        expect(validDesigns).toContain(template.design);
      });
    });
  });

  describe('ECardTemplate Type', () => {
    it('should accept valid template object', () => {
      const template: ECardTemplate = {
        id: 'test-template',
        name: 'Test Template',
        category: 'general',
        backgroundColor: '#FF0000',
        accentColor: '#00FF00',
        textColor: '#0000FF',
        design: 'minimal',
      };
      
      expect(template.id).toBe('test-template');
      expect(template.name).toBe('Test Template');
    });

    it('should accept optional properties', () => {
      const template: ECardTemplate = {
        id: 'test-template',
        name: 'Test Template',
        category: 'anniversary',
        backgroundColor: '#FF0000',
        accentColor: '#00FF00',
        textColor: '#0000FF',
        design: 'confetti',
        imageUrl: 'https://example.com/image.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
      };
      
      expect(template.imageUrl).toBeDefined();
      expect(template.thumbnail).toBeDefined();
    });
  });

  describe('CelebrationMessage Type', () => {
    it('should accept valid message object', () => {
      const message: CelebrationMessage = {
        id: 'msg-1',
        employeeId: 'emp-123',
        senderName: 'John Doe',
        senderRole: 'peer',
        message: 'Congratulations on your anniversary!',
        eCard: ECARD_TEMPLATES[0],
        createdAt: '2026-01-01T00:00:00Z',
        approved: true,
      };
      
      expect(message.id).toBe('msg-1');
      expect(message.employeeId).toBe('emp-123');
    });

    it('should accept optional properties', () => {
      const message: CelebrationMessage = {
        id: 'msg-1',
        employeeId: 'emp-123',
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        senderRole: 'manager',
        message: 'Great work!',
        eCard: ECARD_TEMPLATES[0],
        photoUrl: 'https://example.com/photo.jpg',
        videoUrl: 'https://example.com/video.mp4',
        createdAt: '2026-01-01T00:00:00Z',
        approved: false,
        likes: 10,
      };
      
      expect(message.senderEmail).toBeDefined();
      expect(message.photoUrl).toBeDefined();
      expect(message.videoUrl).toBeDefined();
      expect(message.likes).toBe(10);
    });
  });
});
