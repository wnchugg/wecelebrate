import { useState, useEffect } from 'react';
import { AlertCircle, Check, ExternalLink, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { setPublicSiteDomain, clearPublicSiteDomain, getPublicSiteOrigin } from '../../utils/url';

/**
 * Banner that prompts admins to configure the deployed site domain
 * when running in Figma preview environment
 */
export function DeployedDomainBanner() {
  const [isPreviewEnv, setIsPreviewEnv] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [domain, setDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if we're in a preview environment
    const hostname = window.location.hostname;
    const inPreview = hostname.includes('-v2-figmaiframepreview.figma.site');
    setIsPreviewEnv(inPreview);

    if (inPreview) {
      // Check if domain is already configured
      const storedDomain = localStorage.getItem('figma-public-site-domain');
      if (!storedDomain) {
        setShowBanner(true);
      }
      setDomain(storedDomain || '');
    }
  }, []);

  const handleSave = () => {
    if (!domain.trim()) {
      alert('Please enter a valid domain');
      return;
    }

    // Validate that it looks like a URL
    try {
      const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      const normalizedDomain = `https://${url.hostname}`;
      
      setIsSaving(true);
      setPublicSiteDomain(normalizedDomain);
      
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        setShowBanner(false);
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2';
        successDiv.innerHTML = `
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="font-medium">Deployed domain configured successfully!</span>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      }, 500);
    } catch (err) {
      alert('Please enter a valid domain (e.g., https://your-site.figma.site or your-site.figma.site)');
    }
  };

  const handleClear = () => {
    clearPublicSiteDomain();
    setDomain('');
    setShowBanner(true);
    setIsEditing(false);
  };

  // Don't show banner if not in preview environment
  if (!isPreviewEnv) {
    return null;
  }

  // Show compact indicator if domain is configured
  if (!showBanner && domain) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Public site domain configured
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                <strong>Domain:</strong> <span className="font-mono">{domain}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowBanner(true);
                setIsEditing(true);
              }}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show setup banner if domain not configured or user is editing
  if (!showBanner && !domain) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Configure Your Deployed Site Domain
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            You're currently in the Figma preview environment. To ensure "View Public Site" links work correctly, 
            please enter your actual deployed site domain below.
          </p>
          
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-amber-900 mb-1">
                  Deployed Site URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="https://your-site.figma.site"
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !domain.trim()}
                    size="sm"
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      if (!domain) {
                        setShowBanner(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Example: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">https://top-brick-95471034.figma.site</code>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                Configure Now
              </Button>
              <Button
                onClick={() => setShowBanner(false)}
                variant="outline"
                size="sm"
              >
                Dismiss
              </Button>
              <a
                href="https://help.figma.com/hc/en-us/articles/360039827134-View-and-share-your-prototypes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 underline"
              >
                <ExternalLink className="w-3 h-3" />
                Learn more
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
