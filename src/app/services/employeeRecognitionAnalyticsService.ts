// Employee Recognition Analytics Service - handles employee milestone and recognition data

export interface RecognitionMetrics {
  totalEmployees: number;
  activeRecognitions: number;
  upcomingMilestones: number;
  avgTenure: number;
  participationRate: number;
  redemptionRate: number;
  totalSpent: number;
  avgGiftValue: number;
  employeeGrowth: number;
  engagementScore: number;
}

export interface MilestoneBreakdown {
  milestone: string;
  count: number;
  percentage: number;
  avgGiftValue: number;
  totalSpent: number;
  color?: string;
}

export interface DepartmentInsights {
  departmentId: string;
  department: string;
  employees: number;
  recognitions: number;
  avgTenure: number;
  participationRate: number;
  totalSpent: number;
  avgSpendPerEmployee: number;
}

export interface RecognitionTimeline {
  month: string;
  recognitions: number;
  spent: number;
  milestones: number;
  engagement: number;
}

export interface TenureDistribution {
  range: string;
  count: number;
  percentage: number;
  avgGiftValue: number;
}

export interface ProgramROI {
  metric: string;
  baseline: number;
  withProgram: number;
  improvement: number;
  impactValue?: number;
}

export interface EngagementBreakdown {
  category: string;
  score: number;
  benchmark: number;
  status: 'excellent' | 'good' | 'needs-improvement';
}

export interface TopRecognizedEmployee {
  employeeId: string;
  name: string;
  department: string;
  years: number;
  recognitions: number;
  totalValue: number;
  lastGift: string;
  lastGiftDate: string;
}

export interface UpcomingMilestone {
  employeeId: string;
  name: string;
  department: string;
  milestone: string;
  date: string;
  daysAway: number;
  estimatedGiftValue: number;
}

export interface MilestoneTrend {
  month: string;
  year1: number;
  year3: number;
  year5: number;
  year10: number;
  year15: number;
}

export interface RecognitionDetail {
  recognitionId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  milestone: string;
  date: string;
  giftSelected: string;
  giftValue: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
}

class EmployeeRecognitionAnalyticsService {
  private baseUrl: string;

  constructor() {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project-id';
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
  }

  /**
   * Fetch overall recognition metrics
   */
  async getRecognitionMetrics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<RecognitionMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recognition metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recognition metrics:', error);
      return this.getMockRecognitionMetrics();
    }
  }

  /**
   * Fetch milestone breakdown
   */
  async getMilestoneBreakdown(): Promise<MilestoneBreakdown[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/milestones`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch milestone breakdown');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching milestone breakdown:', error);
      return this.getMockMilestoneBreakdown();
    }
  }

  /**
   * Fetch department insights
   */
  async getDepartmentInsights(): Promise<DepartmentInsights[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/departments`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department insights');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching department insights:', error);
      return this.getMockDepartmentInsights();
    }
  }

  /**
   * Fetch recognition timeline
   */
  async getRecognitionTimeline(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<RecognitionTimeline[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/timeline?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recognition timeline');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recognition timeline:', error);
      return this.getMockRecognitionTimeline();
    }
  }

  /**
   * Fetch tenure distribution
   */
  async getTenureDistribution(): Promise<TenureDistribution[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/tenure-distribution`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenure distribution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tenure distribution:', error);
      return this.getMockTenureDistribution();
    }
  }

  /**
   * Fetch program ROI metrics
   */
  async getProgramROI(): Promise<ProgramROI[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/roi`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch program ROI');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching program ROI:', error);
      return this.getMockProgramROI();
    }
  }

  /**
   * Fetch engagement breakdown
   */
  async getEngagementBreakdown(): Promise<EngagementBreakdown[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/engagement`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch engagement breakdown');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching engagement breakdown:', error);
      return this.getMockEngagementBreakdown();
    }
  }

  /**
   * Fetch top recognized employees
   */
  async getTopRecognizedEmployees(limit: number = 10): Promise<TopRecognizedEmployee[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/top-employees?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top recognized employees');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top recognized employees:', error);
      return this.getMockTopRecognizedEmployees();
    }
  }

  /**
   * Fetch upcoming milestones
   */
  async getUpcomingMilestones(days: number = 30): Promise<UpcomingMilestone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/upcoming-milestones?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming milestones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming milestones:', error);
      return this.getMockUpcomingMilestones();
    }
  }

  /**
   * Fetch milestone trends
   */
  async getMilestoneTrends(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<MilestoneTrend[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/milestone-trends?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch milestone trends');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching milestone trends:', error);
      return this.getMockMilestoneTrends();
    }
  }

  /**
   * Fetch recognition details
   */
  async getRecognitionDetails(
    page: number = 1,
    limit: number = 20,
    filters?: {
      department?: string;
      milestone?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ recognitions: RecognitionDetail[]; total: number; page: number; pages: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.department && { department: filters.department }),
        ...(filters?.milestone && { milestone: filters.milestone }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`${this.baseUrl}/analytics/recognition/details?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recognition details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recognition details:', error);
      return {
        recognitions: this.getMockRecognitionDetails(),
        total: 892,
        page: 1,
        pages: 45
      };
    }
  }

  /**
   * Export recognition report
   */
  async exportReport(
    format: 'csv' | 'pdf' | 'xlsx',
    timeRange: '7d' | '30d' | '90d' | '1y',
    includeDepartments: boolean = true
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/recognition/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, timeRange, includeDepartments }),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // Mock data methods

  private getMockRecognitionMetrics(): RecognitionMetrics {
    return {
      totalEmployees: 3847,
      activeRecognitions: 892,
      upcomingMilestones: 234,
      avgTenure: 4.7,
      participationRate: 87.3,
      redemptionRate: 92.5,
      totalSpent: 1247500,
      avgGiftValue: 1399,
      employeeGrowth: 8.5,
      engagementScore: 4.6
    };
  }

  private getMockMilestoneBreakdown(): MilestoneBreakdown[] {
    return [
      { milestone: '1 Year', count: 487, percentage: 35, avgGiftValue: 150, totalSpent: 73050 },
      { milestone: '3 Years', count: 342, percentage: 25, avgGiftValue: 300, totalSpent: 102600 },
      { milestone: '5 Years', count: 287, percentage: 21, avgGiftValue: 500, totalSpent: 143500 },
      { milestone: '10 Years', count: 156, percentage: 11, avgGiftValue: 1000, totalSpent: 156000 },
      { milestone: '15+ Years', count: 112, percentage: 8, avgGiftValue: 1500, totalSpent: 168000 }
    ];
  }

  private getMockDepartmentInsights(): DepartmentInsights[] {
    return [
      { departmentId: 'dept_001', department: 'Engineering', employees: 987, recognitions: 234, avgTenure: 5.2, participationRate: 92.1, totalSpent: 327600, avgSpendPerEmployee: 332 },
      { departmentId: 'dept_002', department: 'Sales', employees: 654, recognitions: 178, avgTenure: 3.8, participationRate: 88.7, totalSpent: 248920, avgSpendPerEmployee: 381 },
      { departmentId: 'dept_003', department: 'Marketing', employees: 432, recognitions: 124, avgTenure: 4.1, participationRate: 85.2, totalSpent: 173680, avgSpendPerEmployee: 402 },
      { departmentId: 'dept_004', department: 'Operations', employees: 543, recognitions: 142, avgTenure: 6.3, participationRate: 89.5, totalSpent: 199220, avgSpendPerEmployee: 367 },
      { departmentId: 'dept_005', department: 'HR', employees: 234, recognitions: 68, avgTenure: 4.9, participationRate: 91.3, totalSpent: 95200, avgSpendPerEmployee: 407 },
      { departmentId: 'dept_006', department: 'Finance', employees: 321, recognitions: 89, avgTenure: 5.7, participationRate: 86.9, totalSpent: 124680, avgSpendPerEmployee: 388 }
    ];
  }

  private getMockRecognitionTimeline(): RecognitionTimeline[] {
    return [
      { month: 'Jan', recognitions: 142, spent: 198800, milestones: 87, engagement: 4.5 },
      { month: 'Feb', recognitions: 128, spent: 179200, milestones: 78, engagement: 4.4 },
      { month: 'Mar', recognitions: 165, spent: 231000, milestones: 102, engagement: 4.6 },
      { month: 'Apr', recognitions: 149, spent: 208600, milestones: 91, engagement: 4.5 },
      { month: 'May', recognitions: 178, spent: 249200, milestones: 109, engagement: 4.7 },
      { month: 'Jun', recognitions: 187, spent: 261800, milestones: 115, engagement: 4.8 }
    ];
  }

  private getMockTenureDistribution(): TenureDistribution[] {
    return [
      { range: '0-1 Years', count: 892, percentage: 23, avgGiftValue: 125 },
      { range: '1-3 Years', count: 1154, percentage: 30, avgGiftValue: 225 },
      { range: '3-5 Years', count: 962, percentage: 25, avgGiftValue: 400 },
      { range: '5-10 Years', count: 577, percentage: 15, avgGiftValue: 750 },
      { range: '10+ Years', count: 262, percentage: 7, avgGiftValue: 1250 }
    ];
  }

  private getMockProgramROI(): ProgramROI[] {
    return [
      { metric: 'Retention', baseline: 75, withProgram: 89, improvement: 14, impactValue: 2800000 },
      { metric: 'Engagement', baseline: 68, withProgram: 87, improvement: 19, impactValue: 1950000 },
      { metric: 'Productivity', baseline: 72, withProgram: 85, improvement: 13, impactValue: 3200000 },
      { metric: 'Satisfaction', baseline: 70, withProgram: 92, improvement: 22, impactValue: 1500000 }
    ];
  }

  private getMockEngagementBreakdown(): EngagementBreakdown[] {
    return [
      { category: 'Program Awareness', score: 92, benchmark: 85, status: 'excellent' },
      { category: 'Gift Selection', score: 88, benchmark: 80, status: 'excellent' },
      { category: 'Redemption Process', score: 85, benchmark: 82, status: 'good' },
      { category: 'Gift Quality', score: 91, benchmark: 85, status: 'excellent' },
      { category: 'Personalization', score: 84, benchmark: 80, status: 'good' },
      { category: 'Overall Satisfaction', score: 89, benchmark: 82, status: 'excellent' }
    ];
  }

  private getMockTopRecognizedEmployees(): TopRecognizedEmployee[] {
    return [
      { employeeId: 'emp_001', name: 'Sarah Johnson', department: 'Engineering', years: 10, recognitions: 12, totalValue: 5400, lastGift: 'Smart Watch', lastGiftDate: '2026-02-10' },
      { employeeId: 'emp_002', name: 'Michael Chen', department: 'Sales', years: 8, recognitions: 10, totalValue: 2800, lastGift: 'Wireless Headphones', lastGiftDate: '2026-02-08' },
      { employeeId: 'emp_003', name: 'Emily Rodriguez', department: 'Marketing', years: 7, recognitions: 9, totalValue: 3150, lastGift: 'Gift Card Bundle', lastGiftDate: '2026-01-25' }
    ];
  }

  private getMockUpcomingMilestones(): UpcomingMilestone[] {
    return [
      { employeeId: 'emp_101', name: 'James Wilson', department: 'Engineering', milestone: '5 Years', date: '2026-02-20', daysAway: 5, estimatedGiftValue: 500 },
      { employeeId: 'emp_102', name: 'Anna Martinez', department: 'Sales', milestone: '3 Years', date: '2026-02-22', daysAway: 7, estimatedGiftValue: 300 },
      { employeeId: 'emp_103', name: 'Robert Taylor', department: 'Marketing', milestone: '10 Years', date: '2026-02-25', daysAway: 10, estimatedGiftValue: 1000 }
    ];
  }

  private getMockMilestoneTrends(): MilestoneTrend[] {
    return [
      { month: 'Jan', year1: 82, year3: 58, year5: 47, year10: 28, year15: 19 },
      { month: 'Feb', year1: 75, year3: 52, year5: 43, year10: 25, year15: 17 },
      { month: 'Mar', year1: 95, year3: 68, year5: 55, year10: 32, year15: 22 },
      { month: 'Apr', year1: 88, year3: 62, year5: 51, year10: 29, year15: 20 },
      { month: 'May', year1: 102, year3: 72, year5: 59, year10: 34, year15: 23 },
      { month: 'Jun', year1: 97, year3: 69, year5: 56, year10: 31, year15: 21 }
    ];
  }

  private getMockRecognitionDetails(): RecognitionDetail[] {
    return [
      {
        recognitionId: 'rec_001',
        employeeId: 'emp_001',
        employeeName: 'Sarah Johnson',
        department: 'Engineering',
        milestone: '10 Years',
        date: '2026-02-10',
        giftSelected: 'Smart Watch',
        giftValue: 450,
        status: 'delivered'
      }
    ];
  }
}

// Export singleton instance
export const employeeRecognitionAnalyticsService = new EmployeeRecognitionAnalyticsService();
