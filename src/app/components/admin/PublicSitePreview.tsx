import { ExternalLink, Eye, RefreshCw } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { Button } from '../ui/button';
import { getPublicSiteUrl } from '../../utils/url';

export function PublicSitePreview() {
  const { currentSite } = useSite();

  if (!currentSite) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D91C81] to-[#00B4CC] rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Public Site Preview</h3>
              <p className="text-sm text-gray-600">No site selected</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>⚠️ No site available:</strong> Please select a site from the site selector or create a new site in Site Management.
          </p>
        </div>
      </div>
    );
  }

  const isActive = currentSite.status === 'active';
  // Generate the public URL with site ID parameter
  const publicUrl = getPublicSiteUrl(currentSite.id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D91C81] to-[#00B4CC] rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Public Site Preview</h3>
            <p className="text-sm text-gray-600">View your site as customers see it</p>
          </div>
        </div>
        {isActive && (
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Live
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Site Name</p>
              <p className="font-semibold text-gray-900">{currentSite.name}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Domain</p>
              <p className="font-semibold text-gray-900">{currentSite.domain}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Primary Color</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border border-gray-300" 
                  style={{ backgroundColor: currentSite?.branding?.primaryColor }}
                />
                <span className="font-mono text-xs text-gray-700">{currentSite?.branding?.primaryColor}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Validation Method</p>
              <p className="font-semibold text-gray-900 capitalize">
                {currentSite.settings?.validationMethod?.replace('_', ' ') || 'Not configured'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(publicUrl, '_blank');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Site
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> Changes you make to the site's branding, settings, or gift assignments will be reflected on the public site after refreshing.
          </p>
          <p className="text-xs text-blue-700 mt-1">
            <strong>🔗 Public URL:</strong> <span className="font-mono text-xs">{publicUrl}</span>
          </p>
        </div>
      </div>
    </div>
  );
}