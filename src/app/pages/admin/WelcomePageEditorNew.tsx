/**
 * Welcome Page Editor - New Implementation
 * Uses the shared PageEditor component
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
 */

import React from 'react';
import { useSite } from '../../context/SiteContext';
import { PageEditor } from '../../components/page-editor';
import { SiteSettingsAdapter } from '../../components/page-editor/persistence';
import { PageConfiguration } from '../../components/page-editor/core/types';
import { VisualEditorConfig } from '../../components/page-editor/modes/types';

// Default configuration for welcome page
const defaultConfig: PageConfiguration = {
  version: '1.0.0',
  mode: 'visual',
  visual: {
    title: 'Welcome!',
    message: 'Thank you for being part of our team. We appreciate your hard work and dedication.',
    imageUrl: '',
    authorName: '',
    authorTitle: '',
    videoUrl: '',
    ctaText: 'Continue',
    showCelebrationWall: false,
  },
  blocks: [],
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
      id: 'content',
      title: 'Welcome Message',
      icon: '👋',
      fields: [
        {
          id: 'title',
          label: 'Welcome Title',
          type: 'text',
          defaultValue: 'Welcome!',
          placeholder: 'Enter welcome title',
          validation: [
            { type: 'required', message: 'Title is required' },
          ],
        },
        {
          id: 'message',
          label: 'Welcome Message',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter your welcome message',
          helpText: 'Main message displayed to users',
          validation: [
            { type: 'required', message: 'Message is required' },
          ],
        },
        {
          id: 'imageUrl',
          label: 'Welcome Image',
          type: 'image',
          defaultValue: '',
          placeholder: 'https://...',
          helpText: 'Optional image to display',
        },
        {
          id: 'videoUrl',
          label: 'Welcome Video URL',
          type: 'text',
          defaultValue: '',
          placeholder: 'https://youtube.com/...',
          helpText: 'Optional video (YouTube, Vimeo, etc.)',
        },
      ],
    },
    {
      id: 'author',
      title: 'Message Author',
      icon: '✍️',
      fields: [
        {
          id: 'authorName',
          label: 'Author Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'e.g., John Smith',
          helpText: 'Name of the person sending the message',
        },
        {
          id: 'authorTitle',
          label: 'Author Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'e.g., CEO',
          helpText: 'Title or position of the author',
        },
      ],
    },
    {
      id: 'actions',
      title: 'Call to Action',
      icon: '🎯',
      fields: [
        {
          id: 'ctaText',
          label: 'Button Text',
          type: 'text',
          defaultValue: 'Continue',
          placeholder: 'Enter button text',
          validation: [
            { type: 'required', message: 'Button text is required' },
          ],
        },
      ],
    },
    {
      id: 'features',
      title: 'Additional Features',
      icon: '⚙️',
      fields: [
        {
          id: 'showCelebrationWall',
          label: 'Show Celebration Wall',
          type: 'checkbox',
          defaultValue: false,
          helpText: 'Display celebration messages from colleagues',
        },
      ],
    },
  ],
};

export const WelcomePageEditorNew: React.FC = () => {
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
      pageType="welcome-page"
      pageId={currentSite.id}
      defaultConfig={defaultConfig}
      visualConfig={visualConfig}
      allowedModes={['visual', 'blocks', 'custom']} // All modes enabled
      storageAdapter={storageAdapter}
      storageKey="welcomePageConfig"
      enableDragDrop={false} // Can be enabled later
      enableLayouts={false} // Can be enabled later
      onSave={async (config) => {
        // Configuration saved
      }}
      onChange={(config) => {
        // Configuration changed
      }}
    />
  );
};

export default WelcomePageEditorNew;
