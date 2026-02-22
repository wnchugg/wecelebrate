/**
 * Landing Page Editor - New Implementation
 * Uses the shared PageEditor component
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 */

import React from 'react';
import { useSite } from '../../context/SiteContext';
import { PageEditor } from '../../components/page-editor';
import { SiteSettingsAdapter } from '../../components/page-editor/persistence';
import { PageConfiguration } from '../../components/page-editor/core/types';
import { VisualEditorConfig } from '../../components/page-editor/modes/types';

// Default configuration for landing page
const defaultConfig: PageConfiguration = {
  version: '1.0.0',
  mode: 'visual',
  visual: {
    heroTitle: 'Your Exclusive Gift\nSelection Portal',
    heroSubtitle: 'Welcome to your exclusive gift selection portal. Choose from our curated collection of premium gifts as a token of appreciation for your hard work and dedication.',
    heroBackgroundType: 'gradient',
    heroBackgroundGradient: 'linear-gradient(135deg, #00E5A0 0%, #0066CC 33%, #D91C81 66%, #1B2A5E 100%)',
    heroBackgroundColor: '#1B2A5E',
    ctaText: 'Get Started',
    ctaStyle: 'primary',
    showFeatures: true,
    featuresTitle: 'Why Choose Us',
    showHowItWorks: true,
    howItWorksTitle: 'How It Works',
    showLogo: true,
    logoPosition: 'left',
    showLanguageSelector: true,
  },
  custom: {
    html: '',
    css: '',
    javascript: '',
  },
  metadata: {
    lastModified: new Date().toISOString(),
  },
};

// Visual editor configuration
const visualConfig: VisualEditorConfig = {
  sections: [
    {
      id: 'hero',
      title: 'Hero Section',
      icon: '🎯',
      fields: [
        {
          id: 'heroTitle',
          label: 'Hero Title',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter hero title',
          helpText: 'Main headline displayed on the landing page',
          validation: [
            { type: 'required', message: 'Hero title is required' },
            { type: 'maxLength', value: 200, message: 'Title must be less than 200 characters' },
          ],
        },
        {
          id: 'heroSubtitle',
          label: 'Hero Subtitle',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter hero subtitle',
          helpText: 'Supporting text below the main headline',
        },
        {
          id: 'heroBackgroundType',
          label: 'Background Type',
          type: 'select',
          defaultValue: 'gradient',
          options: [
            { label: 'Gradient', value: 'gradient' },
            { label: 'Solid Color', value: 'solid' },
            { label: 'Image', value: 'image' },
          ],
        },
        {
          id: 'heroBackgroundGradient',
          label: 'Background Gradient',
          type: 'text',
          defaultValue: '',
          placeholder: 'linear-gradient(...)',
          conditional: {
            field: 'heroBackgroundType',
            operator: 'equals',
            value: 'gradient',
          },
        },
        {
          id: 'heroBackgroundColor',
          label: 'Background Color',
          type: 'color',
          defaultValue: '#1B2A5E',
          conditional: {
            field: 'heroBackgroundType',
            operator: 'equals',
            value: 'solid',
          },
        },
        {
          id: 'heroBackgroundImage',
          label: 'Background Image URL',
          type: 'image',
          defaultValue: '',
          placeholder: 'https://...',
          conditional: {
            field: 'heroBackgroundType',
            operator: 'equals',
            value: 'image',
          },
        },
        {
          id: 'ctaText',
          label: 'Call-to-Action Button Text',
          type: 'text',
          defaultValue: 'Get Started',
          placeholder: 'Enter button text',
          validation: [
            { type: 'required', message: 'CTA text is required' },
          ],
        },
        {
          id: 'ctaStyle',
          label: 'Button Style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Custom', value: 'custom' },
          ],
        },
      ],
    },
    {
      id: 'features',
      title: 'Features Section',
      icon: '⭐',
      fields: [
        {
          id: 'showFeatures',
          label: 'Show Features Section',
          type: 'checkbox',
          defaultValue: true,
          helpText: 'Display the features section on the landing page',
        },
        {
          id: 'featuresTitle',
          label: 'Features Section Title',
          type: 'text',
          defaultValue: 'Why Choose Us',
          placeholder: 'Enter section title',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
      ],
    },
    {
      id: 'howItWorks',
      title: 'How It Works Section',
      icon: '📋',
      fields: [
        {
          id: 'showHowItWorks',
          label: 'Show How It Works Section',
          type: 'checkbox',
          defaultValue: true,
          helpText: 'Display the how it works section',
        },
        {
          id: 'howItWorksTitle',
          label: 'Section Title',
          type: 'text',
          defaultValue: 'How It Works',
          placeholder: 'Enter section title',
          conditional: {
            field: 'showHowItWorks',
            operator: 'equals',
            value: true,
          },
        },
      ],
    },
    {
      id: 'branding',
      title: 'Branding',
      icon: '🎨',
      fields: [
        {
          id: 'showLogo',
          label: 'Show Logo',
          type: 'checkbox',
          defaultValue: true,
          helpText: 'Display company logo',
        },
        {
          id: 'logoPosition',
          label: 'Logo Position',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
          conditional: {
            field: 'showLogo',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'showLanguageSelector',
          label: 'Show Language Selector',
          type: 'checkbox',
          defaultValue: true,
          helpText: 'Display language selector in header',
        },
      ],
    },
  ],
};

export const LandingPageEditorNew: React.FC = () => {
  const { currentSite, updateSite } = useSite();

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading site...</p>
      </div>
    );
  }

  // Create storage adapter
  const storageAdapter = new SiteSettingsAdapter(
    currentSite.id,
    updateSite,
    () => currentSite
  );

  return (
    <PageEditor
      pageType="landing-page"
      pageId={currentSite.id}
      defaultConfig={defaultConfig}
      visualConfig={visualConfig}
      allowedModes={['visual', 'blocks', 'custom']} // All modes enabled
      storageAdapter={storageAdapter}
      storageKey="landingPageConfig"
      onSave={async (config) => {
        // Configuration saved
      }}
      onChange={(config) => {
        // Configuration changed
      }}
    />
  );
};

export default LandingPageEditorNew;
