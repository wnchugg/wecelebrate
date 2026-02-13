// Export & Reporting Service - handles report generation, scheduling, and distribution

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  format: 'pdf' | 'csv' | 'xlsx';
  schedule: string;
  lastGenerated: string;
  recipients: number;
  status: 'active' | 'paused';
  dataSource: string[];
  filters?: Record<string, any>;
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  generatedAt: string;
  generatedBy: string;
  size: string;
  downloads: number;
  status: 'completed' | 'failed' | 'processing';
  fileUrl?: string;
  errorMessage?: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  lastRun: string;
  recipients: string[];
  format: string;
  status: 'active' | 'paused';
  templateId: string;
  timezone: string;
}

export interface ReportStatistics {
  totalReports: number;
  thisMonth: number;
  scheduled: number;
  activeRecipients: number;
  avgGenerationTime: string;
  totalDownloads: number;
}

export interface CustomReportConfig {
  name: string;
  description?: string;
  metrics: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  format: 'pdf' | 'csv' | 'xlsx';
  timeRange: {
    start: string;
    end: string;
  };
}

export interface ReportRecipient {
  id: string;
  email: string;
  name: string;
  role: string;
  reportTypes: string[];
  frequency: string;
}

export interface ReportDistribution {
  reportId: string;
  recipients: string[];
  subject: string;
  message: string;
  scheduleTime?: string;
}

class ExportReportingService {
  private baseUrl: string;

  constructor() {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project-id';
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  /**
   * Get all report templates
   */
  async getReportTemplates(category?: string): Promise<ReportTemplate[]> {
    try {
      const queryParams = category ? `?category=${category}` : '';
      const response = await fetch(`${this.baseUrl}/reports/templates${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return this.getMockReportTemplates();
    }
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<ReportStatistics> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/statistics`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      return this.getMockReportStatistics();
    }
  }

  /**
   * Generate a report from template
   */
  async generateReport(
    templateId: string,
    format?: 'pdf' | 'csv' | 'xlsx',
    filters?: Record<string, any>
  ): Promise<GeneratedReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId, format, filters }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(config: CustomReportConfig): Promise<GeneratedReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/generate-custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate custom report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }

  /**
   * Get generated reports history
   */
  async getGeneratedReports(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: string;
      format?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ reports: GeneratedReport[]; total: number; page: number; pages: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.format && { format: filters.format }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`${this.baseUrl}/reports/history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report history:', error);
      return {
        reports: this.getMockGeneratedReports(),
        total: 1247,
        page: 1,
        pages: 63
      };
    }
  }

  /**
   * Download a generated report
   */
  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/download/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<ScheduledReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/scheduled`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheduled reports');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      return this.getMockScheduledReports();
    }
  }

  /**
   * Create a scheduled report
   */
  async createScheduledReport(report: Omit<ScheduledReport, 'id'>): Promise<ScheduledReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/scheduled`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error('Failed to create scheduled report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(
    reportId: string,
    updates: Partial<ScheduledReport>
  ): Promise<ScheduledReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/scheduled/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update scheduled report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(reportId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/scheduled/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete scheduled report');
      }
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  }

  /**
   * Distribute a report via email
   */
  async distributeReport(distribution: ReportDistribution): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/distribute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(distribution),
      });

      if (!response.ok) {
        throw new Error('Failed to distribute report');
      }
    } catch (error) {
      console.error('Error distributing report:', error);
      throw error;
    }
  }

  /**
   * Get report recipients
   */
  async getReportRecipients(): Promise<ReportRecipient[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/recipients`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report recipients');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report recipients:', error);
      return this.getMockReportRecipients();
    }
  }

  /**
   * Quick export analytics dashboard
   */
  async quickExportAnalytics(
    format: 'pdf' | 'csv' | 'xlsx',
    timeRange: '7d' | '30d' | '90d' | '1y'
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/quick-export/analytics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, timeRange }),
      });

      if (!response.ok) {
        throw new Error('Failed to export analytics');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  // Mock data methods

  private getMockReportTemplates(): ReportTemplate[] {
    return [
      {
        id: 'tmpl_001',
        name: 'Monthly Analytics Summary',
        description: 'Comprehensive monthly analytics across all metrics',
        category: 'Analytics',
        format: 'pdf',
        schedule: 'Monthly',
        lastGenerated: '2026-02-01',
        recipients: 12,
        status: 'active',
        dataSource: ['analytics', 'orders', 'gifting']
      },
      {
        id: 'tmpl_002',
        name: 'Weekly Order Report',
        description: 'Order volume, revenue, and fulfillment metrics',
        category: 'Orders',
        format: 'xlsx',
        schedule: 'Weekly',
        lastGenerated: '2026-02-10',
        recipients: 8,
        status: 'active',
        dataSource: ['orders', 'fulfillment']
      },
      {
        id: 'tmpl_003',
        name: 'Employee Recognition Summary',
        description: 'Milestone tracking and recognition program performance',
        category: 'Recognition',
        format: 'pdf',
        schedule: 'Quarterly',
        lastGenerated: '2026-01-15',
        recipients: 5,
        status: 'active',
        dataSource: ['recognition', 'employees']
      }
    ];
  }

  private getMockReportStatistics(): ReportStatistics {
    return {
      totalReports: 1247,
      thisMonth: 156,
      scheduled: 24,
      activeRecipients: 87,
      avgGenerationTime: '2.3s',
      totalDownloads: 3542
    };
  }

  private getMockGeneratedReports(): GeneratedReport[] {
    return [
      {
        id: 'rep_001',
        name: 'Executive Dashboard - Week 7',
        type: 'Executive',
        format: 'PDF',
        generatedAt: '2026-02-14 09:30',
        generatedBy: 'System Admin',
        size: '2.4 MB',
        downloads: 15,
        status: 'completed'
      },
      {
        id: 'rep_002',
        name: 'Weekly Order Report - Week 7',
        type: 'Orders',
        format: 'Excel',
        generatedAt: '2026-02-14 08:00',
        generatedBy: 'Automated',
        size: '1.8 MB',
        downloads: 8,
        status: 'completed'
      }
    ];
  }

  private getMockScheduledReports(): ScheduledReport[] {
    return [
      {
        id: 'sched_001',
        name: 'Executive Dashboard',
        frequency: 'Weekly (Monday 9:00 AM)',
        nextRun: '2026-02-17 09:00',
        lastRun: '2026-02-10 09:00',
        recipients: ['executives@company.com', 'board@company.com'],
        format: 'PDF',
        status: 'active',
        templateId: 'tmpl_006',
        timezone: 'America/Los_Angeles'
      },
      {
        id: 'sched_002',
        name: 'Weekly Order Report',
        frequency: 'Weekly (Monday 8:00 AM)',
        nextRun: '2026-02-17 08:00',
        lastRun: '2026-02-10 08:00',
        recipients: ['operations@company.com', 'fulfillment@company.com'],
        format: 'Excel',
        status: 'active',
        templateId: 'tmpl_002',
        timezone: 'America/Los_Angeles'
      }
    ];
  }

  private getMockReportRecipients(): ReportRecipient[] {
    return [
      {
        id: 'recip_001',
        email: 'executives@company.com',
        name: 'Executive Team',
        role: 'Executive',
        reportTypes: ['Executive', 'Analytics'],
        frequency: 'Weekly'
      },
      {
        id: 'recip_002',
        email: 'operations@company.com',
        name: 'Operations Team',
        role: 'Operations',
        reportTypes: ['Orders', 'Fulfillment'],
        frequency: 'Daily'
      }
    ];
  }
}

// Export singleton instance
export const exportReportingService = new ExportReportingService();
