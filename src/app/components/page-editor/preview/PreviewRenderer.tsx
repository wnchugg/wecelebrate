/**
 * Preview Renderer Component
 * Requirements: 7.6, 7.7, 7.8
 */

import React from 'react';
import { PreviewRendererProps } from './types';
import { blockRegistry } from '../blocks/BlockRegistry';

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  config,
  device,
  interactive = false,
}) => {
  const renderVisualMode = () => {
    if (!config.visual) {
      return <div className="text-gray-500">No visual configuration</div>;
    }

    return (
      <div className="space-y-6">
        {Object.entries(config.visual).map(([key, value]) => (
          <div key={key} className="border-b pb-4">
            <div className="text-sm font-medium text-gray-500 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </div>
            <div className="text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBlocksMode = () => {
    if (!config.blocks || config.blocks.length === 0) {
      return <div className="text-gray-500">No blocks added yet</div>;
    }

    return (
      <div className="space-y-4">
        {config.blocks.map((block) => {
          const definition = blockRegistry.get(block.type);

          if (!definition) {
            return (
              <div key={block.id} className="p-4 border border-red-300 bg-red-50 rounded">
                <p className="text-red-600">Unknown block type: {block.type}</p>
              </div>
            );
          }

          const blockStyles: React.CSSProperties = {
            padding: typeof block.styles.padding === 'string' ? block.styles.padding : undefined,
            margin: typeof block.styles.margin === 'string' ? block.styles.margin : undefined,
            backgroundColor: block.styles.backgroundColor,
            textAlign: typeof block.styles.textAlign === 'string' ? block.styles.textAlign as any : undefined,
            borderRadius: block.styles.borderRadius,
            boxShadow: block.styles.boxShadow,
          };

          return (
            <div key={block.id} style={blockStyles} className="border rounded">
              {definition.renderPreview(block)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCustomMode = () => {
    if (!config.custom) {
      return <div className="text-gray-500">No custom code</div>;
    }

    const { html, css, javascript } = config.custom;

    // Create iframe content with CSP
    const iframeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none';">
          <style>
            body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
            ${css || ''}
          </style>
        </head>
        <body>
          ${html || '<p>No HTML content</p>'}
          <script>
            try {
              ${javascript || ''}
            } catch (error) {
              console.error('Custom JavaScript error:', error);
            }
          </script>
        </body>
      </html>
    `;

    return (
      <iframe
        srcDoc={iframeContent}
        className="w-full h-full min-h-[600px] border-0"
        sandbox="allow-scripts"
        title="Custom Code Preview"
      />
    );
  };

  return (
    <div className="preview-renderer">
      {config.mode === 'visual' && renderVisualMode()}
      {config.mode === 'blocks' && renderBlocksMode()}
      {config.mode === 'custom' && renderCustomMode()}
    </div>
  );
};