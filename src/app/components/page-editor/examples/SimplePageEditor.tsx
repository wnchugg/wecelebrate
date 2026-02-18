/**
 * Simple Page Editor Example
 * Demonstrates basic usage of the PageEditor component
 */

import React from 'react';
import { PageEditor } from '../core/PageEditor';
import { PageConfiguration } from '../core/types';
import { SiteSettingsAdapter } from '../persistence/adapters/SiteSettingsAdapter';

// Example default configuration
const defaultConfig: PageConfiguration = {
  version: '1.0.0',
  mode: 'visual',
  visual: {
    title: 'Welcome',
    subtitle: 'Get started with our platform',
  },
  metadata: {
    lastModified: new Date().toISOString(),
  },
};

// Example visual editor configuration
const visualConfig = {
  sections: [
    {
      id: 'hero',
      title: 'Hero Section',
      fields: [
        {
          id: 'title',
          label: 'Title',
          type: 'text' as const,
          defaultValue: '',
          placeholder: 'Enter title',
        },
        {
          id: 'subtitle',
          label: 'Subtitle',
          type: 'textarea' as const,
          defaultValue: '',
          placeholder: 'Enter subtitle',
        },
      ],
    },
  ],
};

export const SimplePageEditorExample: React.FC = () => {
  // Mock storage adapter for demonstration
  const storageAdapter = new SiteSettingsAdapter(
    'example-site-id',
    async (id, updates) => {
      console.log('Mock save:', id, updates);
    },
    () => ({ settings: {} })
  );

  return (
    <PageEditor
      pageType="example"
      defaultConfig={defaultConfig}
      visualConfig={visualConfig}
      allowedModes={['visual', 'blocks', 'custom']}
      storageAdapter={storageAdapter}
      storageKey="examplePageConfig"
      onSave={async (config) => {
        console.log('Page saved:', config);
      }}
      onChange={(config) => {
        console.log('Page changed:', config);
      }}
    />
  );
};

export default SimplePageEditorExample;
