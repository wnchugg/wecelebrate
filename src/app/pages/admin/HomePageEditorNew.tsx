/**
 * Home Page Editor - New Implementation
 * Uses the shared PageEditor component
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8
 */

import React from 'react';
import { PageEditor } from '../../components/page-editor';
import { GlobalSettingsAdapter } from '../../components/page-editor/persistence';
import { PageConfiguration } from '../../components/page-editor/core/types';
import { VisualEditorConfig } from '../../components/page-editor/modes/types';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

// Default configuration for home page
const defaultConfig: PageConfiguration = {
  version: '1.0.0',
  mode: 'visual',
  visual: {
    // Hero Section
    badgeIcon: 'Gift',
    badgeText: 'Premium Event Gifting Platform',
    title: 'Celebrate Every Milestone',
    subtitle: 'Choose from our curated selection of premium gifts for your employees or corporate events',
    gradientColors: 'from-blue-600 via-blue-700 to-indigo-800',
    
    // Delivery Section
    deliverySectionTitle: 'Choose Your Delivery Option',
    deliverySectionSubtitle: 'Select how you\'d like to receive your gifts - shipped directly to your company or to individual employees',
    
    // Company Shipping
    companyShippingTitle: 'Ship to Company',
    companyShippingDescription: 'Have all gifts delivered to your company address for bulk distribution. Ideal for corporate events and team celebrations.',
    companyShippingCTA: 'Browse Catalog',
    
    // Employee Shipping
    employeeShippingTitle: 'Ship to Employee',
    employeeShippingDescription: 'Send gifts directly to individual employee addresses. Perfect for remote teams and personalized recognition.',
    employeeShippingCTA: 'Browse Catalog',
    
    // Features
    showFeatures: true,
    feature1Icon: 'Gift',
    feature1Title: 'Premium Selection',
    feature1Description: 'Curated gifts from top brands to celebrate your team',
    
    feature2Icon: 'Building2',
    feature2Title: 'Flexible Delivery',
    feature2Description: 'Choose company or individual shipping options',
    
    feature3Icon: 'ArrowRight',
    feature3Title: 'Easy Process',
    feature3Description: 'Simple checkout and tracking for all orders',
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
          id: 'badgeIcon',
          label: 'Badge Icon',
          type: 'text',
          defaultValue: 'Gift',
          placeholder: 'Icon name',
          helpText: 'Lucide icon name (e.g., Gift, Star, Award)',
        },
        {
          id: 'badgeText',
          label: 'Badge Text',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter badge text',
        },
        {
          id: 'title',
          label: 'Main Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter main title',
          validation: [
            { type: 'required', message: 'Title is required' },
          ],
        },
        {
          id: 'subtitle',
          label: 'Subtitle',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter subtitle',
        },
        {
          id: 'gradientColors',
          label: 'Background Gradient',
          type: 'text',
          defaultValue: 'from-blue-600 via-blue-700 to-indigo-800',
          placeholder: 'Tailwind gradient classes',
          helpText: 'e.g., from-blue-600 to-purple-600',
        },
      ],
    },
    {
      id: 'delivery',
      title: 'Delivery Section',
      icon: '🚚',
      fields: [
        {
          id: 'deliverySectionTitle',
          label: 'Section Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter section title',
        },
        {
          id: 'deliverySectionSubtitle',
          label: 'Section Subtitle',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter section subtitle',
        },
        {
          id: 'companyShippingTitle',
          label: 'Company Shipping Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter title',
        },
        {
          id: 'companyShippingDescription',
          label: 'Company Shipping Description',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter description',
        },
        {
          id: 'companyShippingCTA',
          label: 'Company Shipping Button Text',
          type: 'text',
          defaultValue: 'Browse Catalog',
          placeholder: 'Enter button text',
        },
        {
          id: 'employeeShippingTitle',
          label: 'Employee Shipping Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter title',
        },
        {
          id: 'employeeShippingDescription',
          label: 'Employee Shipping Description',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter description',
        },
        {
          id: 'employeeShippingCTA',
          label: 'Employee Shipping Button Text',
          type: 'text',
          defaultValue: 'Browse Catalog',
          placeholder: 'Enter button text',
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
          label: 'Show Features',
          type: 'checkbox',
          defaultValue: true,
          helpText: 'Display the features section',
        },
        {
          id: 'feature1Icon',
          label: 'Feature 1 Icon',
          type: 'text',
          defaultValue: 'Gift',
          placeholder: 'Icon name',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature1Title',
          label: 'Feature 1 Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter title',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature1Description',
          label: 'Feature 1 Description',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter description',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature2Icon',
          label: 'Feature 2 Icon',
          type: 'text',
          defaultValue: 'Building2',
          placeholder: 'Icon name',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature2Title',
          label: 'Feature 2 Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter title',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature2Description',
          label: 'Feature 2 Description',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter description',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature3Icon',
          label: 'Feature 3 Icon',
          type: 'text',
          defaultValue: 'ArrowRight',
          placeholder: 'Icon name',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature3Title',
          label: 'Feature 3 Title',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter title',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'feature3Description',
          label: 'Feature 3 Description',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Enter description',
          conditional: {
            field: 'showFeatures',
            operator: 'equals',
            value: true,
          },
        },
      ],
    },
  ],
};

export const HomePageEditorNew: React.FC = () => {
  // Create storage adapter for global settings
  const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/global-settings`;
  const storageAdapter = new GlobalSettingsAdapter(endpoint, publicAnonKey);

  return (
    <PageEditor
      pageType="home-page"
      defaultConfig={defaultConfig}
      visualConfig={visualConfig}
      allowedModes={['visual']} // Only visual mode for home page
      storageAdapter={storageAdapter}
      storageKey="home-page"
      onSave={async (config) => {
        console.log('[HomePageEditor] Configuration saved:', config);
      }}
      onChange={(config) => {
        console.log('[HomePageEditor] Configuration changed:', config);
      }}
    />
  );
};

export default HomePageEditorNew;
