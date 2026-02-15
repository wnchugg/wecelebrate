import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteTemplate, GlobalTemplate } from '../types/emailTemplates';
import { toast } from 'sonner';
import * as emailTemplateApi from '../services/emailTemplateApi';
import { getAccessToken } from '../lib/apiClient';

interface EmailTemplateContextType {
  // Global templates (read-only library)
  globalTemplates: GlobalTemplate[];
  getGlobalTemplateById: (id: string) => GlobalTemplate | undefined;
  refreshGlobalTemplates: () => Promise<void>;
  seedGlobalTemplates: () => Promise<void>;
  
  // Site-level templates
  siteTemplates: SiteTemplate[];
  getSiteTemplateById: (id: string) => SiteTemplate | undefined;
  getSiteTemplatesBySite: (siteId: string) => SiteTemplate[];
  getSiteTemplateByType: (siteId: string, type: string) => SiteTemplate | undefined;
  refreshSiteTemplates: (siteId?: string) => Promise<void>;
  
  // Site template CRUD
  addSiteTemplate: (siteId: string, globalTemplateId: string) => Promise<void>;
  updateSiteTemplate: (id: string, updates: Partial<SiteTemplate>) => Promise<void>;
  deleteSiteTemplate: (id: string) => Promise<void>;
  resetSiteTemplateToDefault: (id: string) => Promise<void>;
  
  // Loading states
  isLoadingGlobal: boolean;
  isLoadingSite: boolean;
}

const EmailTemplateContext = createContext<EmailTemplateContextType | undefined>(undefined);

export function EmailTemplateProvider({ children }: { children: ReactNode }) {
  const [globalTemplates, setGlobalTemplates] = useState<GlobalTemplate[]>([]);
  const [siteTemplates, setSiteTemplates] = useState<SiteTemplate[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [isLoadingSite, setIsLoadingSite] = useState(false);

  // Load global templates on mount (with token check)
  useEffect(() => {
    // Only try to load if we have a token
    const token = getAccessToken();
    console.warn('[EmailTemplateContext] useEffect - Token available:', !!token);
    console.warn('[EmailTemplateContext] useEffect - Token preview:', token?.substring(0, 30) + '...');
    
    if (token) {
      console.warn('[EmailTemplateContext] Token found, loading global templates...');
      refreshGlobalTemplates();
    } else {
      console.warn('[EmailTemplateContext] No token available, skipping initial load');
    }
  }, []);

  // ==================== GLOBAL TEMPLATES ====================

  const refreshGlobalTemplates = async () => {
    setIsLoadingGlobal(true);
    try {
      const templates = await emailTemplateApi.fetchGlobalTemplates();
      setGlobalTemplates(templates);
      
      // If no templates exist, automatically seed them
      if (templates.length === 0) {
        console.warn('No global templates found, seeding...');
        await seedGlobalTemplates();
      }
    } catch (error: any) {
      console.error('Failed to load global templates:', error);
      // Don't show toast on initial load failure
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const seedGlobalTemplates = async () => {
    try {
      const result = await emailTemplateApi.seedGlobalTemplates();
      toast.success(`${result.count} global templates initialized`);
      await refreshGlobalTemplates();
    } catch (error: any) {
      console.error('Failed to seed global templates:', error);
      toast.error('Failed to initialize global templates');
    }
  };

  const getGlobalTemplateById = (id: string): GlobalTemplate | undefined => {
    return globalTemplates.find(t => t.id === id);
  };

  // ==================== SITE TEMPLATES ====================

  const refreshSiteTemplates = async (siteId?: string) => {
    setIsLoadingSite(true);
    try {
      const templates = siteId
        ? await emailTemplateApi.fetchSiteTemplatesBySite(siteId)
        : await emailTemplateApi.fetchSiteTemplates();
      setSiteTemplates(templates);
    } catch (error: any) {
      console.error('Failed to load site templates:', error);
      toast.error('Failed to load site templates');
    } finally {
      setIsLoadingSite(false);
    }
  };

  const getSiteTemplateById = (id: string): SiteTemplate | undefined => {
    return siteTemplates.find(t => t.id === id);
  };

  const getSiteTemplatesBySite = (siteId: string): SiteTemplate[] => {
    return siteTemplates.filter(t => t.siteId === siteId);
  };

  const getSiteTemplateByType = (siteId: string, type: string): SiteTemplate | undefined => {
    return siteTemplates.find(t => t.siteId === siteId && t.type === type);
  };

  // ==================== SITE TEMPLATE CRUD ====================

  const addSiteTemplate = async (siteId: string, globalTemplateId: string) => {
    try {
      const globalTemplate = getGlobalTemplateById(globalTemplateId);
      if (!globalTemplate) {
        toast.error('Global template not found');
        return;
      }

      const newTemplate: Omit<SiteTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        siteId,
        globalTemplateId,
        type: globalTemplate.type,
        name: globalTemplate.name,
        emailEnabled: true,
        subject: globalTemplate.defaultSubject,
        htmlContent: globalTemplate.defaultHtmlContent,
        textContent: globalTemplate.defaultTextContent,
        pushEnabled: false,
        pushTitle: globalTemplate.defaultPushTitle,
        pushBody: globalTemplate.defaultPushBody,
        smsEnabled: false,
        smsContent: globalTemplate.defaultSmsContent,
        enabled: true,
      };

      const created = await emailTemplateApi.createSiteTemplate(newTemplate);
      setSiteTemplates(prev => [...prev, created]);
      toast.success('Template added successfully');
    } catch (error: any) {
      console.error('Failed to add site template:', error);
      toast.error('Failed to add template');
    }
  };

  const updateSiteTemplate = async (id: string, updates: Partial<SiteTemplate>) => {
    try {
      const updated = await emailTemplateApi.updateSiteTemplate(id, updates);
      setSiteTemplates(prev =>
        prev.map(template => (template.id === id ? updated : template))
      );
      toast.success('Template updated successfully');
    } catch (error: any) {
      console.error('Failed to update site template:', error);
      toast.error('Failed to update template');
    }
  };

  const deleteSiteTemplate = async (id: string) => {
    try {
      await emailTemplateApi.deleteSiteTemplate(id);
      setSiteTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Template removed successfully');
    } catch (error: any) {
      console.error('Failed to delete site template:', error);
      toast.error('Failed to remove template');
    }
  };

  const resetSiteTemplateToDefault = async (id: string) => {
    try {
      const siteTemplate = getSiteTemplateById(id);
      if (!siteTemplate) {
        toast.error('Site template not found');
        return;
      }

      const globalTemplate = getGlobalTemplateById(siteTemplate.globalTemplateId);
      if (!globalTemplate) {
        toast.error('Global template not found');
        return;
      }

      await updateSiteTemplate(id, {
        subject: globalTemplate.defaultSubject,
        htmlContent: globalTemplate.defaultHtmlContent,
        textContent: globalTemplate.defaultTextContent,
        pushTitle: globalTemplate.defaultPushTitle,
        pushBody: globalTemplate.defaultPushBody,
        smsContent: globalTemplate.defaultSmsContent,
      });
      
      toast.success('Template reset to defaults');
    } catch (error: any) {
      console.error('Failed to reset site template:', error);
      toast.error('Failed to reset template');
    }
  };

  return (
    <EmailTemplateContext.Provider
      value={{
        globalTemplates,
        getGlobalTemplateById,
        refreshGlobalTemplates,
        seedGlobalTemplates,
        siteTemplates,
        getSiteTemplateById,
        getSiteTemplatesBySite,
        getSiteTemplateByType,
        refreshSiteTemplates,
        addSiteTemplate,
        updateSiteTemplate,
        deleteSiteTemplate,
        resetSiteTemplateToDefault,
        isLoadingGlobal,
        isLoadingSite,
      }}
    >
      {children}
    </EmailTemplateContext.Provider>
  );
}

export function useEmailTemplate() {
  const context = useContext(EmailTemplateContext);
  if (context === undefined) {
    throw new Error('useEmailTemplate must be used within an EmailTemplateProvider');
  }
  return context;
}