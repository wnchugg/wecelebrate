/**
 * Standard block type registrations
 * Requirements: 6.1
 */

import React from 'react';
import { BlockDefinition, BlockContent, BlockStyles } from '../types';
import { sanitizeHtml, sanitizeText } from '../../utils/security';
import {
  HeroIcon,
  TextIcon,
  ImageIcon,
  VideoIcon,
  ButtonIcon,
  SpacerIcon,
  CustomHtmlIcon,
  LayoutIcon,
} from './icons';

/**
 * Hero block definition
 */
export const heroBlockDefinition: BlockDefinition = {
  type: 'hero',
  label: 'Hero Section',
  description: 'Large header section with title, subtitle, and call-to-action',
  icon: HeroIcon,
  category: 'layout',
  defaultContent: {
    title: 'Welcome to Our Site',
    subtitle: 'Create amazing experiences',
    buttonText: 'Get Started',
    buttonUrl: '#',
    backgroundImage: '',
  },
  defaultStyles: {
    padding: '80px 20px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  contentSchema: {
    title: { type: 'string', required: true, default: '' },
    subtitle: { type: 'string', required: false, default: '' },
    buttonText: { type: 'string', required: false, default: '' },
    buttonUrl: { type: 'string', required: false, default: '#' },
    backgroundImage: { type: 'string', required: false, default: '' },
  },
  renderPreview: (block) => {
    return React.createElement('div', {
      style: {
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: block.styles.backgroundColor || '#f8f9fa',
      },
    }, [
      React.createElement('h1', { key: 'title' }, block.content.title || 'Hero Title'),
      React.createElement('p', { key: 'subtitle' }, block.content.subtitle || 'Hero subtitle'),
      block.content.buttonText && React.createElement('button', { key: 'button' }, block.content.buttonText),
    ]);
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Hero editor placeholder');
  },
};

/**
 * Text block definition
 */
export const textBlockDefinition: BlockDefinition = {
  type: 'text',
  label: 'Text',
  description: 'Rich text content block',
  icon: TextIcon,
  category: 'content',
  defaultContent: {
    text: '<p>Enter your text here...</p>',
  },
  defaultStyles: {
    padding: '20px',
  },
  contentSchema: {
    text: { type: 'string', required: true, default: '<p></p>' },
  },
  renderPreview: (block) => {
    const sanitizedText = sanitizeText(block.content.text || '');
    return React.createElement('div', {
      dangerouslySetInnerHTML: { __html: sanitizedText },
    });
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Text editor placeholder');
  },
};

/**
 * Image block definition
 */
export const imageBlockDefinition: BlockDefinition = {
  type: 'image',
  label: 'Image',
  description: 'Image with optional caption',
  icon: ImageIcon,
  category: 'media',
  defaultContent: {
    src: '',
    alt: '',
    caption: '',
  },
  defaultStyles: {
    textAlign: 'center',
  },
  contentSchema: {
    src: { type: 'string', required: true, default: '' },
    alt: { type: 'string', required: false, default: '' },
    caption: { type: 'string', required: false, default: '' },
  },
  renderPreview: (block) => {
    return React.createElement('div', { style: { textAlign: 'center' } }, [
      block.content.src && React.createElement('img', {
        key: 'img',
        src: block.content.src,
        alt: block.content.alt || '',
        style: { maxWidth: '100%' },
      }),
      block.content.caption && React.createElement('p', { key: 'caption' }, block.content.caption),
    ]);
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Image editor placeholder');
  },
};

/**
 * Video block definition
 */
export const videoBlockDefinition: BlockDefinition = {
  type: 'video',
  label: 'Video',
  description: 'Embedded video player',
  icon: VideoIcon,
  category: 'media',
  defaultContent: {
    url: '',
    provider: 'youtube',
  },
  defaultStyles: {
    textAlign: 'center',
  },
  contentSchema: {
    url: { type: 'string', required: true, default: '' },
    provider: { type: 'string', required: false, default: 'youtube' },
  },
  renderPreview: (block) => {
    return React.createElement('div', {
      style: { textAlign: 'center', padding: '20px' },
    }, 'Video: ' + (block.content.url || 'No URL'));
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Video editor placeholder');
  },
};

/**
 * CTA Button block definition
 */
export const ctaButtonBlockDefinition: BlockDefinition = {
  type: 'cta-button',
  label: 'Call to Action Button',
  description: 'Button with link',
  icon: ButtonIcon,
  category: 'interactive',
  defaultContent: {
    text: 'Click Here',
    url: '#',
    variant: 'primary',
  },
  defaultStyles: {
    textAlign: 'center',
    padding: '20px',
  },
  contentSchema: {
    text: { type: 'string', required: true, default: 'Button' },
    url: { type: 'string', required: true, default: '#' },
    variant: { type: 'string', required: false, default: 'primary' },
  },
  renderPreview: (block) => {
    return React.createElement('div', { style: { textAlign: 'center', padding: '20px' } },
      React.createElement('button', null, block.content.text || 'Button')
    );
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Button editor placeholder');
  },
};

/**
 * Spacer block definition
 */
export const spacerBlockDefinition: BlockDefinition = {
  type: 'spacer',
  label: 'Spacer',
  description: 'Vertical spacing',
  icon: SpacerIcon,
  category: 'layout',
  defaultContent: {
    height: '40px',
  },
  defaultStyles: {},
  contentSchema: {
    height: { type: 'string', required: true, default: '40px' },
  },
  renderPreview: (block) => {
    return React.createElement('div', {
      style: {
        height: block.content.height || '40px',
        backgroundColor: '#f0f0f0',
        border: '1px dashed #ccc',
      },
    });
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Spacer editor placeholder');
  },
};

/**
 * Custom HTML block definition
 */
export const customHtmlBlockDefinition: BlockDefinition = {
  type: 'custom-html',
  label: 'Custom HTML',
  description: 'Custom HTML content',
  icon: CustomHtmlIcon,
  category: 'advanced',
  defaultContent: {
    html: '<div>Custom HTML</div>',
  },
  defaultStyles: {},
  contentSchema: {
    html: { type: 'string', required: true, default: '' },
  },
  renderPreview: (block) => {
    const sanitizedHtml = sanitizeHtml(block.content.html || '', {
      allowedTags: ['p', 'div', 'span', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3'],
      allowedAttributes: ['href', 'target', 'rel', 'class'],
    });
    return React.createElement('div', {
      dangerouslySetInnerHTML: { __html: sanitizedHtml },
    });
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Custom HTML editor placeholder');
  },
};

/**
 * All standard block definitions
 */
export const standardBlockDefinitions = [
  heroBlockDefinition,
  textBlockDefinition,
  imageBlockDefinition,
  videoBlockDefinition,
  ctaButtonBlockDefinition,
  spacerBlockDefinition,
  customHtmlBlockDefinition,
];

/**
 * Celebration Wall block definition
 */
export const celebrationWallBlockDefinition: BlockDefinition = {
  type: 'celebration-wall',
  label: 'Celebration Wall',
  description: 'Display celebration messages from colleagues',
  icon: TextIcon, // Reusing icon
  category: 'interactive',
  defaultContent: {
    title: 'Celebration Messages',
    displayMode: 'wall',
    allowPeerMessages: true,
  },
  defaultStyles: {
    padding: '40px 20px',
  },
  contentSchema: {
    title: { type: 'string', required: false, default: 'Celebration Messages' },
    displayMode: { type: 'string', required: false, default: 'wall' },
    allowPeerMessages: { type: 'boolean', required: false, default: true },
  },
  renderPreview: (block) => {
    return React.createElement('div', {
      style: { padding: '20px', textAlign: 'center' },
    }, [
      React.createElement('h3', { key: 'title' }, block.content.title || 'Celebration Messages'),
      React.createElement('p', { key: 'desc', style: { color: '#666' } }, 'Celebration wall will display here'),
    ]);
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Celebration wall editor placeholder');
  },
};

/**
 * Testimonial block definition
 */
export const testimonialBlockDefinition: BlockDefinition = {
  type: 'testimonial',
  label: 'Testimonial',
  description: 'Customer or employee testimonial',
  icon: TextIcon, // Reusing icon
  category: 'content',
  defaultContent: {
    quote: 'This is an amazing experience!',
    author: 'John Doe',
    role: 'Customer',
    avatar: '',
  },
  defaultStyles: {
    padding: '30px',
    textAlign: 'center',
  },
  contentSchema: {
    quote: { type: 'string', required: true, default: '' },
    author: { type: 'string', required: true, default: '' },
    role: { type: 'string', required: false, default: '' },
    avatar: { type: 'string', required: false, default: '' },
  },
  renderPreview: (block) => {
    return React.createElement('div', {
      style: { padding: '20px', textAlign: 'center' },
    }, [
      React.createElement('blockquote', { key: 'quote', style: { fontSize: '18px', fontStyle: 'italic', marginBottom: '10px' } }, 
        `"${block.content.quote || 'Quote'}"`
      ),
      React.createElement('div', { key: 'author', style: { fontWeight: 'bold' } }, block.content.author || 'Author'),
      block.content.role && React.createElement('div', { key: 'role', style: { color: '#666', fontSize: '14px' } }, block.content.role),
    ]);
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Testimonial editor placeholder');
  },
};

/**
 * Gift Preview block definition
 */
export const giftPreviewBlockDefinition: BlockDefinition = {
  type: 'gift-preview',
  label: 'Gift Preview',
  description: 'Preview of available gifts',
  icon: ImageIcon, // Reusing icon
  category: 'interactive',
  defaultContent: {
    title: 'Featured Gifts',
    showPricing: false,
    itemsPerRow: 3,
  },
  defaultStyles: {
    padding: '40px 20px',
  },
  contentSchema: {
    title: { type: 'string', required: false, default: 'Featured Gifts' },
    showPricing: { type: 'boolean', required: false, default: false },
    itemsPerRow: { type: 'number', required: false, default: 3 },
  },
  renderPreview: (block) => {
    return React.createElement('div', {
      style: { padding: '20px' },
    }, [
      React.createElement('h3', { key: 'title', style: { textAlign: 'center', marginBottom: '20px' } }, 
        block.content.title || 'Featured Gifts'
      ),
      React.createElement('p', { key: 'desc', style: { textAlign: 'center', color: '#666' } }, 
        'Gift preview grid will display here'
      ),
    ]);
  },
  renderEditor: (block, onChange) => {
    return React.createElement('div', null, 'Gift preview editor placeholder');
  },
};

/**
 * Layout block definition
 */
export const layoutBlockDefinition: BlockDefinition = {
  type: 'layout',
  label: 'Layout (Columns)',
  description: 'Multi-column layout container for organizing blocks',
  icon: LayoutIcon,
  category: 'layout',
  defaultContent: {
    columnCount: 2,
    columnRatios: [1, 1],
    gap: '1rem',
    stackOnMobile: true,
    verticalAlign: 'top',
  },
  defaultStyles: {
    padding: '20px',
  },
  contentSchema: {
    columnCount: { type: 'number', required: true, default: 2 },
    columnRatios: { type: 'array', required: true, default: [1, 1] },
    gap: { type: 'string', required: false, default: '1rem' },
    stackOnMobile: { type: 'boolean', required: false, default: true },
    verticalAlign: { type: 'string', required: false, default: 'top' },
  },
  renderPreview: (block) => {
    const content = block.content as any;
    return React.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${content.columnCount || 2}, 1fr)`,
        gap: content.gap || '1rem',
        padding: '20px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
      },
    }, Array.from({ length: content.columnCount || 2 }).map((_, i) =>
      React.createElement('div', {
        key: i,
        style: {
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#666',
        },
      }, `Column ${i + 1}`)
    ));
  },
  renderEditor: (block, onChange) => {
    const content = block.content as any;
    return React.createElement('div', { className: 'space-y-3' }, [
      React.createElement('div', { key: 'columns' }, [
        React.createElement('label', {
          key: 'label',
          className: 'block text-sm font-medium text-gray-700 mb-1',
        }, 'Number of Columns'),
        React.createElement('select', {
          key: 'select',
          value: content.columnCount || 2,
          onChange: (e: any) => {
            const newCount = Number(e.target.value);
            onChange({
              content: {
                ...content,
                columnCount: newCount,
                columnRatios: Array(newCount).fill(1),
              },
            });
          },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
        }, [1, 2, 3, 4].map(num =>
          React.createElement('option', { key: num, value: num }, num)
        )),
      ]),
      React.createElement('div', { key: 'gap' }, [
        React.createElement('label', {
          key: 'label',
          className: 'block text-sm font-medium text-gray-700 mb-1',
        }, 'Gap'),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: content.gap || '1rem',
          onChange: (e: any) => onChange({
            content: { ...content, gap: e.target.value },
          }),
          placeholder: 'e.g., 1rem, 20px',
          className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
        }),
      ]),
      React.createElement('div', { key: 'stack', className: 'flex items-center gap-2' }, [
        React.createElement('input', {
          key: 'checkbox',
          type: 'checkbox',
          checked: content.stackOnMobile !== false,
          onChange: (e: any) => onChange({
            content: { ...content, stackOnMobile: e.target.checked },
          }),
          className: 'rounded border-gray-300',
        }),
        React.createElement('label', {
          key: 'label',
          className: 'text-sm font-medium text-gray-700',
        }, 'Stack on Mobile'),
      ]),
    ]);
  },
  allowChildren: true,
  maxChildren: 100, // Effectively unlimited, but prevents infinite nesting
};

/**
 * All block definitions including additional types
 */
export const allBlockDefinitions = [
  ...standardBlockDefinitions,
  celebrationWallBlockDefinition,
  testimonialBlockDefinition,
  giftPreviewBlockDefinition,
  layoutBlockDefinition,
];
