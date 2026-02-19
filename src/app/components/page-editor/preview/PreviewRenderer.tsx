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
  pageType,
}) => {
  const renderLandingPagePreview = () => {
    if (!config.visual) {
      return <div className="text-gray-500">No visual configuration</div>;
    }

    const visual = config.visual;

    // Determine background style based on type
    const getBackgroundStyle = () => {
      if (visual.heroBackgroundType === 'gradient' && visual.heroBackgroundGradient) {
        return { background: visual.heroBackgroundGradient };
      }
      if (visual.heroBackgroundType === 'solid' && visual.heroBackgroundColor) {
        return { backgroundColor: visual.heroBackgroundColor };
      }
      if (visual.heroBackgroundType === 'image' && visual.heroBackgroundImage) {
        return {
          backgroundImage: `url(${visual.heroBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      return { backgroundColor: '#1B2A5E' }; // Default
    };

    // Determine button style
    const getButtonStyle = () => {
      if (visual.ctaStyle === 'primary') {
        return 'bg-white text-gray-900 hover:bg-gray-100';
      }
      if (visual.ctaStyle === 'secondary') {
        return 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900';
      }
      return 'bg-blue-600 text-white hover:bg-blue-700'; // Custom default
    };

    return (
      <div className="w-full min-h-screen bg-gray-50">
        {/* Header */}
        {visual.showLogo !== false && (
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className={`flex items-center ${visual.logoPosition === 'center' ? 'mx-auto' : ''}`}>
                <div className="text-xl font-bold text-gray-900">Company Logo</div>
              </div>
              {visual.showLanguageSelector && (
                <div className="text-sm text-gray-600">🌐 Language</div>
              )}
            </div>
          </header>
        )}

        {/* Hero Section */}
        <section
          className="relative py-20 px-4 text-white"
          style={getBackgroundStyle()}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 whitespace-pre-line">
              {visual.heroTitle || 'Your Exclusive Gift Selection Portal'}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {visual.heroSubtitle || 'Welcome to your exclusive gift selection portal.'}
            </p>
            <button
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${getButtonStyle()}`}
            >
              {visual.ctaText || 'Get Started'}
            </button>
          </div>
        </section>

        {/* Features Section */}
        {visual.showFeatures && (
          <section className="py-16 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {visual.featuresTitle || 'Why Choose Us'}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Feature {i}</h3>
                    <p className="text-gray-600">Feature description goes here</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        {visual.showHowItWorks && (
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {visual.howItWorksTitle || 'How It Works'}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {i}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Step {i}</h3>
                    <p className="text-gray-600">Step description goes here</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderWelcomePagePreview = () => {
    if (!config.visual) {
      return <div className="text-gray-500">No visual configuration</div>;
    }

    const visual = config.visual;

    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Image or Video */}
          {visual.videoUrl ? (
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500">🎥 Video: {visual.videoUrl}</div>
            </div>
          ) : visual.imageUrl ? (
            <div className="aspect-video bg-gray-200">
              <img src={visual.imageUrl} alt="Welcome" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-6xl">👋</div>
            </div>
          )}

          {/* Content */}
          <div className="p-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {visual.title || 'Welcome!'}
            </h1>
            <p className="text-lg text-gray-600 mb-8 whitespace-pre-line">
              {visual.message || 'Thank you for being part of our team.'}
            </p>

            {/* Author */}
            {(visual.authorName || visual.authorTitle) && (
              <div className="mb-8 text-gray-700">
                {visual.authorName && <div className="font-semibold">{visual.authorName}</div>}
                {visual.authorTitle && <div className="text-sm">{visual.authorTitle}</div>}
              </div>
            )}

            {/* CTA Button */}
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {visual.ctaText || 'Continue'}
            </button>

            {/* Celebration Wall */}
            {visual.showCelebrationWall && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Messages from Your Team
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg text-left">
                      <p className="text-sm text-gray-600 italic">"Congratulations!"</p>
                      <p className="text-xs text-gray-500 mt-2">- Colleague {i}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHomePagePreview = () => {
    if (!config.visual) {
      return <div className="text-gray-500">No visual configuration</div>;
    }

    const visual = config.visual;

    return (
      <div className="w-full min-h-screen bg-white">
        {/* Hero Section */}
        <section className={`relative py-24 px-4 text-white bg-gradient-to-r ${visual.gradientColors || 'from-blue-600 to-indigo-800'}`}>
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            {visual.badgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-6">
                <span>{visual.badgeIcon || '🎁'}</span>
                <span>{visual.badgeText}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {visual.title || 'Celebrate Every Milestone'}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              {visual.subtitle || 'Choose from our curated selection of premium gifts'}
            </p>
          </div>
        </section>

        {/* Delivery Options Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {visual.deliverySectionTitle || 'Choose Your Delivery Option'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {visual.deliverySectionSubtitle || 'Select how you\'d like to receive your gifts'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Company Shipping */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {visual.companyShippingTitle || 'Ship to Company'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {visual.companyShippingDescription || 'Have all gifts delivered to your company address'}
                </p>
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  {visual.companyShippingCTA || 'Browse Catalog'}
                </button>
              </div>

              {/* Employee Shipping */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {visual.employeeShippingTitle || 'Ship to Employee'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {visual.employeeShippingDescription || 'Send gifts directly to individual employee addresses'}
                </p>
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  {visual.employeeShippingCTA || 'Browse Catalog'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        {visual.showFeatures && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="text-5xl mb-4">
                      {visual[`feature${i}Icon`] === 'Gift' ? '🎁' : 
                       visual[`feature${i}Icon`] === 'Building2' ? '🏢' : 
                       visual[`feature${i}Icon`] === 'ArrowRight' ? '➡️' : '⭐'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {visual[`feature${i}Title`] || `Feature ${i}`}
                    </h3>
                    <p className="text-gray-600">
                      {visual[`feature${i}Description`] || 'Feature description'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderVisualMode = () => {
    // Render based on page type
    if (pageType === 'landing-page') {
      return renderLandingPagePreview();
    }
    if (pageType === 'welcome-page') {
      return renderWelcomePagePreview();
    }
    if (pageType === 'home-page') {
      return renderHomePagePreview();
    }

    // Fallback: generic preview
    if (!config.visual) {
      return <div className="text-gray-500">No visual configuration</div>;
    }

    return (
      <div className="space-y-6 p-6">
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