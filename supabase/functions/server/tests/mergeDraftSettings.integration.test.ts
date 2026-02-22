/**
 * Integration test for _hasUnpublishedChanges flag
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 6.1
 */

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { mergeDraftSettings } from '../helpers.ts';

Deno.test('Integration: _hasUnpublishedChanges flag is set correctly for site without draft', () => {
  // Simulate a site from the database with no draft_settings
  const siteFromDb = {
    id: 'test-site-1',
    name: 'Production Site',
    slug: 'production-site',
    status: 'active',
    client_id: 'client-123',
    catalog_id: 'catalog-456',
    draft_settings: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = mergeDraftSettings(siteFromDb);

  // Requirement 3.3: When draft_settings is null, flag should be false
  assertEquals(result._hasUnpublishedChanges, false);
  
  // All original fields should be preserved
  assertEquals(result.id, siteFromDb.id);
  assertEquals(result.name, siteFromDb.name);
  assertEquals(result.status, siteFromDb.status);
});

Deno.test('Integration: _hasUnpublishedChanges flag is set correctly for site with draft', () => {
  // Simulate a site from the database with draft_settings
  const siteFromDb = {
    id: 'test-site-2',
    name: 'Production Site',
    slug: 'production-site',
    status: 'active',
    client_id: 'client-123',
    catalog_id: 'catalog-456',
    draft_settings: {
      name: 'Updated Production Site',
      status: 'inactive',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = mergeDraftSettings(siteFromDb);

  // Requirement 3.2: When draft_settings is populated, flag should be true
  assertEquals(result._hasUnpublishedChanges, true);
  
  // Requirement 3.4: Flag should be available to UI components
  assertEquals('_hasUnpublishedChanges' in result, true);
  
  // Draft values should override live values
  assertEquals(result.name, 'Updated Production Site');
  assertEquals(result.status, 'inactive');
  
  // Original draft_settings should be preserved
  assertEquals(result._draftSettings, siteFromDb.draft_settings);
});

Deno.test('Integration: _hasUnpublishedChanges flag after discarding draft', () => {
  // Simulate a site after draft has been discarded (draft_settings set to null)
  const siteAfterDiscard = {
    id: 'test-site-3',
    name: 'Production Site',
    slug: 'production-site',
    status: 'active',
    client_id: 'client-123',
    catalog_id: 'catalog-456',
    draft_settings: null,  // Cleared by discard operation
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = mergeDraftSettings(siteAfterDiscard);

  // After discard, flag should be false
  assertEquals(result._hasUnpublishedChanges, false);
  
  // No draft settings should be present
  assertEquals(result._draftSettings, undefined);
});

Deno.test('Integration: _hasUnpublishedChanges flag with complex draft settings', () => {
  // Simulate a site with complex nested draft settings
  const siteFromDb = {
    id: 'test-site-4',
    name: 'Production Site',
    slug: 'production-site',
    status: 'active',
    draft_settings: {
      name: 'Updated Site',
      branding: {
        logo: 'new-logo.png',
        colors: {
          primary: '#FF0000',
          secondary: '#00FF00',
        },
      },
      validation_methods: ['email', 'sso'],
      selection_start_date: '2024-01-01',
      selection_end_date: '2024-12-31',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = mergeDraftSettings(siteFromDb);

  // Requirement 3.1: System checks if draft_settings is populated
  assertEquals(result._hasUnpublishedChanges, true);
  
  // Complex nested objects should be merged correctly
  assertEquals(result.name, 'Updated Site');
  assertEquals(result.branding.logo, 'new-logo.png');
  assertEquals(result.branding.colors.primary, '#FF0000');
  assertEquals(result.validation_methods, ['email', 'sso']);
});

Deno.test('Integration: _hasUnpublishedChanges flag consistency across multiple calls', () => {
  const siteWithDraft = {
    id: 'test-site-5',
    name: 'Test Site',
    draft_settings: { name: 'Updated' },
  };

  const siteWithoutDraft = {
    id: 'test-site-6',
    name: 'Test Site',
    draft_settings: null,
  };

  // Multiple calls should produce consistent results
  const result1 = mergeDraftSettings(siteWithDraft);
  const result2 = mergeDraftSettings(siteWithDraft);
  const result3 = mergeDraftSettings(siteWithoutDraft);
  const result4 = mergeDraftSettings(siteWithoutDraft);

  assertEquals(result1._hasUnpublishedChanges, true);
  assertEquals(result2._hasUnpublishedChanges, true);
  assertEquals(result3._hasUnpublishedChanges, false);
  assertEquals(result4._hasUnpublishedChanges, false);
});
