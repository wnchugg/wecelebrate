import { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { HeaderFooterConfig, NavigationItem, FooterColumn } from '../../types/siteCustomization';
import { toast } from 'sonner';

const defaultConfig: HeaderFooterConfig = {
  header: {
    enabled: true,
    layout: 'full',
    logo: { url: '', alt: 'Logo', height: 40, link: '/' },
    navigation: { enabled: false, items: [] },
    progressBar: { enabled: true, style: 'steps', showLabels: true },
    languageSelector: { enabled: true, position: 'right' },
    siteSwitcher: { enabled: false, style: 'dropdown', showInHeader: true },
    authButtons: { enabled: false, showWhenAuthenticated: false, showWhenUnauthenticated: false },
    search: { enabled: false, placeholder: 'Search...' },
  },
  footer: {
    enabled: true,
    layout: 'simple',
    backgroundColor: '#1B2A5E',
    textColor: '#FFFFFF',
    links: { enabled: true, columns: [] },
    social: { enabled: false, links: [] },
    copyright: { enabled: true, text: 'All rights reserved', year: 'auto' },
    logos: { enabled: false, items: [] },
    newsletter: { enabled: false, title: '', placeholder: '', buttonText: '' },
  },
  sticky: { header: true, footer: false },
  display: { hideOnRoutes: [], authenticatedOnly: false, unauthenticatedOnly: false },
};

export function HeaderFooterConfiguration() {
  const { currentSite, currentClient, updateSite, updateClient } = useSite();
  const [config, setConfig] = useState<HeaderFooterConfig>(defaultConfig);
  const [applyTo, setApplyTo] = useState<'site' | 'client'>('site');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    footer: true,
    display: false,
  });

  useEffect(() => {
    // Load existing configuration
    if (applyTo === 'site' && currentSite?.headerFooterConfig) {
      setConfig(currentSite.headerFooterConfig);
    } else if (applyTo === 'client' && currentClient?.headerFooterConfig) {
      setConfig(currentClient.headerFooterConfig);
    } else {
      setConfig(defaultConfig);
    }
  }, [currentSite, currentClient, applyTo]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (applyTo === 'site' && currentSite) {
        await updateSite(currentSite.id, { headerFooterConfig: config });
        toast.success('Header/Footer configuration saved to site');
      } else if (applyTo === 'client' && currentClient) {
        await updateClient(currentClient.id, { headerFooterConfig: config });
        toast.success('Header/Footer configuration saved to client (applies to all sites)');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const addNavigationItem = () => {
    setConfig(prev => ({
      ...prev,
      header: {
        ...prev.header,
        navigation: {
          ...prev.header.navigation,
          items: [
            ...prev.header.navigation.items,
            {
              id: `nav-${Date.now()}`,
              label: 'New Link',
              url: '/',
              external: false,
              order: prev.header.navigation.items.length,
            },
          ],
        },
      },
    }));
  };

  const removeNavigationItem = (id: string) => {
    setConfig(prev => ({
      ...prev,
      header: {
        ...prev.header,
        navigation: {
          ...prev.header.navigation,
          items: prev.header.navigation.items.filter(item => item.id !== id),
        },
      },
    }));
  };

  const updateNavigationItem = (id: string, updates: Partial<NavigationItem>) => {
    setConfig(prev => ({
      ...prev,
      header: {
        ...prev.header,
        navigation: {
          ...prev.header.navigation,
          items: prev.header.navigation.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
        },
      },
    }));
  };

  const addFooterColumn = () => {
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: {
          ...prev.footer.links,
          columns: [
            ...prev.footer.links.columns,
            {
              id: `col-${Date.now()}`,
              title: 'New Column',
              links: [],
              order: prev.footer.links.columns.length,
            },
          ],
        },
      },
    }));
  };

  const removeFooterColumn = (id: string) => {
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: {
          ...prev.footer.links,
          columns: prev.footer.links.columns.filter(col => col.id !== id),
        },
      },
    }));
  };

  const updateFooterColumn = (id: string, updates: Partial<FooterColumn>) => {
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: {
          ...prev.footer.links,
          columns: prev.footer.links.columns.map(col =>
            col.id === id ? { ...col, ...updates } : col
          ),
        },
      },
    }));
  };

  const addFooterLink = (columnId: string) => {
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: {
          ...prev.footer.links,
          columns: prev.footer.links.columns.map(col =>
            col.id === columnId
              ? {
                  ...col,
                  links: [...col.links, { label: 'New Link', url: '/', external: false }],
                }
              : col
          ),
        },
      },
    }));
  };

  const addSocialLink = () => {
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        social: {
          ...prev.footer.social,
          links: [
            ...prev.footer.social.links,
            { platform: 'facebook', url: 'https://facebook.com' },
          ],
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Header & Footer Configuration</h1>
          <p className="mt-2 text-gray-600">
            Customize the header and footer for your {applyTo === 'site' ? 'site' : 'client'}
          </p>
        </div>

        {/* Apply To Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Apply Configuration To:</label>
          <div className="flex gap-4">
            <button
              onClick={() => setApplyTo('site')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                applyTo === 'site'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Current Site Only
            </button>
            <button
              onClick={() => setApplyTo('client')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                applyTo === 'client'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Sites in Client (Default)
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {applyTo === 'site'
              ? 'Changes will only apply to the current site'
              : 'Changes will apply as default for all sites in this client'}
          </p>
        </div>

        {/* Header Configuration */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <button
            onClick={() => toggleSection('header')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">Header Configuration</h2>
            {expandedSections.header ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.header && (
            <div className="px-6 pb-6 space-y-6">
              {/* Header Enabled */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#D91C81] transition-colors">
                <input
                  type="checkbox"
                  id="header-enabled"
                  checked={config.header.enabled}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      header: { ...prev.header, enabled: e.target.checked },
                    }))
                  }
                  className="h-5 w-5 text-[#D91C81] focus:ring-[#D91C81] focus:ring-offset-2 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="header-enabled" className="text-base font-medium text-gray-900 cursor-pointer flex-1">
                  Enable Header
                  <span className="block text-sm font-normal text-gray-500 mt-0.5">
                    Display the header at the top of all pages
                  </span>
                </label>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <select
                  value={config.header.layout}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      header: { ...prev.header, layout: e.target.value as any },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                >
                  <option value="simple">Simple</option>
                  <option value="full">Full</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Logo Configuration */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Logo</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={config.header.logo.url}
                      onChange={(e) =>
                        setConfig(prev => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            logo: { ...prev.header.logo, url: e.target.value },
                          },
                        }))
                      }
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                      <input
                        type="text"
                        value={config.header.logo.alt}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            header: {
                              ...prev.header,
                              logo: { ...prev.header.logo, alt: e.target.value },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                      <input
                        type="number"
                        value={config.header.logo.height}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            header: {
                              ...prev.header,
                              logo: { ...prev.header.logo, height: parseInt(e.target.value) },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Navigation</h3>
                  <input
                    type="checkbox"
                    checked={config.header.navigation.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          navigation: { ...prev.header.navigation, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>

                {config.header.navigation.enabled && (
                  <div className="space-y-4">
                    {config.header.navigation.items.map((item) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-md">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateNavigationItem(item.id, { label: e.target.value })}
                            placeholder="Label"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                          />
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateNavigationItem(item.id, { url: e.target.value })}
                            placeholder="URL"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={item.external}
                              onChange={(e) => updateNavigationItem(item.id, { external: e.target.checked })}
                              className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                            />
                            External Link
                          </label>
                          <button
                            onClick={() => removeNavigationItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addNavigationItem}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-[#D91C81] hover:text-[#D91C81] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Navigation Item
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Progress Bar</h3>
                  <input
                    type="checkbox"
                    checked={config.header.progressBar.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          progressBar: { ...prev.header.progressBar, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>

                {config.header.progressBar.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        value={config.header.progressBar.style}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            header: {
                              ...prev.header,
                              progressBar: { ...prev.header.progressBar, style: e.target.value as any },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                      >
                        <option value="steps">Steps</option>
                        <option value="bar">Progress Bar</option>
                        <option value="dots">Dots</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={config.header.progressBar.showLabels}
                        onChange={(e) =>
                          setConfig(prev => ({
                            ...prev,
                            header: {
                              ...prev.header,
                              progressBar: { ...prev.header.progressBar, showLabels: e.target.checked },
                            },
                          }))
                        }
                        className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                      />
                      Show Labels
                    </label>
                  </div>
                )}
              </div>

              {/* Other Features */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Language Selector</span>
                  <input
                    type="checkbox"
                    checked={config.header.languageSelector.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          languageSelector: { ...prev.header.languageSelector, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Site Switcher</span>
                  <input
                    type="checkbox"
                    checked={config.header.siteSwitcher.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          siteSwitcher: { ...prev.header.siteSwitcher, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Search</span>
                  <input
                    type="checkbox"
                    checked={config.header.search.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          search: { ...prev.header.search, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sticky Header</span>
                  <input
                    type="checkbox"
                    checked={config.sticky.header}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        sticky: { ...prev.sticky, header: e.target.checked },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Configuration */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <button
            onClick={() => toggleSection('footer')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">Footer Configuration</h2>
            {expandedSections.footer ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expandedSections.footer && (
            <div className="px-6 pb-6 space-y-6">
              {/* Footer Enabled */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#D91C81] transition-colors">
                <input
                  type="checkbox"
                  id="footer-enabled"
                  checked={config.footer.enabled}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      footer: { ...prev.footer, enabled: e.target.checked },
                    }))
                  }
                  className="h-5 w-5 text-[#D91C81] focus:ring-[#D91C81] focus:ring-offset-2 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="footer-enabled" className="text-base font-medium text-gray-900 cursor-pointer flex-1">
                  Enable Footer
                  <span className="block text-sm font-normal text-gray-500 mt-0.5">
                    Display the footer at the bottom of all pages
                  </span>
                </label>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <select
                  value={config.footer.layout}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      footer: { ...prev.footer, layout: e.target.value as any },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                >
                  <option value="simple">Simple</option>
                  <option value="multi-column">Multi-Column</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={config.footer.backgroundColor}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, backgroundColor: e.target.value },
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <input
                    type="color"
                    value={config.footer.textColor}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        footer: { ...prev.footer, textColor: e.target.value },
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Footer Columns */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Link Columns</h3>
                  <input
                    type="checkbox"
                    checked={config.footer.links.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          links: { ...prev.footer.links, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>

                {config.footer.links.enabled && (
                  <div className="space-y-4">
                    {config.footer.links.columns.map((column) => (
                      <div key={column.id} className="p-4 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                          <input
                            type="text"
                            value={column.title}
                            onChange={(e) => updateFooterColumn(column.id, { title: e.target.value })}
                            placeholder="Column Title"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                          />
                          <button
                            onClick={() => removeFooterColumn(column.id)}
                            className="ml-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {column.links.map((link, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) =>
                                  updateFooterColumn(column.id, {
                                    links: column.links.map((l, i) =>
                                      i === idx ? { ...l, label: e.target.value } : l
                                    ),
                                  })
                                }
                                placeholder="Label"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81] text-sm"
                              />
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) =>
                                  updateFooterColumn(column.id, {
                                    links: column.links.map((l, i) =>
                                      i === idx ? { ...l, url: e.target.value } : l
                                    ),
                                  })
                                }
                                placeholder="URL"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81] text-sm"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => addFooterLink(column.id)}
                            className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-[#D91C81] hover:text-[#D91C81] transition-colors"
                          >
                            + Add Link
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFooterColumn}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-[#D91C81] hover:text-[#D91C81] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Column
                    </button>
                  </div>
                )}
              </div>

              {/* Copyright */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Copyright</h3>
                  <input
                    type="checkbox"
                    checked={config.footer.copyright.enabled}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          copyright: { ...prev.footer.copyright, enabled: e.target.checked },
                        },
                      }))
                    }
                    className="h-4 w-4 text-[#D91C81] focus:ring-[#D91C81] border-gray-300 rounded"
                  />
                </div>

                {config.footer.copyright.enabled && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={config.footer.copyright.text}
                      onChange={(e) =>
                        setConfig(prev => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            copyright: { ...prev.footer.copyright, text: e.target.value },
                          },
                        }))
                      }
                      placeholder="All rights reserved"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-[#D91C81] border border-[#D91C81] rounded-md hover:bg-pink-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setConfig(defaultConfig)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-md hover:bg-[#B71569] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}