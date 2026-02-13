import { useState, useEffect } from 'react';
import {
  Award,
  Users,
  TrendingUp,
  Calendar,
  Gift,
  Heart,
  Star,
  Trophy,
  Target,
  ArrowLeft,
  Download,
  ArrowUpRight,
  DollarSign,
  CheckCircle,
  Clock,
  Activity,
  PieChart as PieChartIcon,
  Building2,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import * as RechartsAll from 'recharts';
const ComposedChart = (RechartsAll as Record<string, unknown>).ComposedChart as typeof BarChart;
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface RecognitionMetrics {
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

interface MilestoneBreakdown {
  milestone: string;
  count: number;
  percentage: number;
  avgGiftValue: number;
  color: string;
}

interface DepartmentInsights {
  department: string;
  employees: number;
  recognitions: number;
  avgTenure: number;
  participationRate: number;
  totalSpent: number;
}

export default function EmployeeRecognitionAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('90d');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange, departmentFilter, milestoneFilter]);

  // Recognition metrics
  const recognitionMetrics: RecognitionMetrics = {
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

  // Milestone breakdown
  const milestoneData: MilestoneBreakdown[] = [
    { milestone: '1 Year', count: 487, percentage: 35, avgGiftValue: 150, color: '#D91C81' },
    { milestone: '3 Years', count: 342, percentage: 25, avgGiftValue: 300, color: '#E94B9E' },
    { milestone: '5 Years', count: 287, percentage: 21, avgGiftValue: 500, color: '#F47BB6' },
    { milestone: '10 Years', count: 156, percentage: 11, avgGiftValue: 1000, color: '#FF9ECE' },
    { milestone: '15+ Years', count: 112, percentage: 8, avgGiftValue: 1500, color: '#FFC1E0' }
  ];

  // Department insights
  const departmentData: DepartmentInsights[] = [
    { department: 'Engineering', employees: 987, recognitions: 234, avgTenure: 5.2, participationRate: 92.1, totalSpent: 327600 },
    { department: 'Sales', employees: 654, recognitions: 178, avgTenure: 3.8, participationRate: 88.7, totalSpent: 248920 },
    { department: 'Marketing', employees: 432, recognitions: 124, avgTenure: 4.1, participationRate: 85.2, totalSpent: 173680 },
    { department: 'Operations', employees: 543, recognitions: 142, avgTenure: 6.3, participationRate: 89.5, totalSpent: 199220 },
    { department: 'HR', employees: 234, recognitions: 68, avgTenure: 4.9, participationRate: 91.3, totalSpent: 95200 },
    { department: 'Finance', employees: 321, recognitions: 89, avgTenure: 5.7, participationRate: 86.9, totalSpent: 124680 }
  ];

  // Recognition timeline
  const timelineData = [
    { month: 'Jan', recognitions: 142, spent: 198800, milestones: 87, engagement: 4.5 },
    { month: 'Feb', recognitions: 128, spent: 179200, milestones: 78, engagement: 4.4 },
    { month: 'Mar', recognitions: 165, spent: 231000, milestones: 102, engagement: 4.6 },
    { month: 'Apr', recognitions: 149, spent: 208600, milestones: 91, engagement: 4.5 },
    { month: 'May', recognitions: 178, spent: 249200, milestones: 109, engagement: 4.7 },
    { month: 'Jun', recognitions: 187, spent: 261800, milestones: 115, engagement: 4.8 }
  ];

  // Tenure distribution
  const tenureDistribution = [
    { range: '0-1 Years', count: 892, percentage: 23 },
    { range: '1-3 Years', count: 1154, percentage: 30 },
    { range: '3-5 Years', count: 962, percentage: 25 },
    { range: '5-10 Years', count: 577, percentage: 15 },
    { range: '10+ Years', count: 262, percentage: 7 }
  ];

  // Program ROI data
  const roiData = [
    { metric: 'Retention', baseline: 75, withProgram: 89, improvement: 14 },
    { metric: 'Engagement', baseline: 68, withProgram: 87, improvement: 19 },
    { metric: 'Productivity', baseline: 72, withProgram: 85, improvement: 13 },
    { metric: 'Satisfaction', baseline: 70, withProgram: 92, improvement: 22 }
  ];

  // Monthly milestone trends
  const milestoneTrends = [
    { month: 'Jan', year1: 82, year3: 58, year5: 47, year10: 28, year15: 19 },
    { month: 'Feb', year1: 75, year3: 52, year5: 43, year10: 25, year15: 17 },
    { month: 'Mar', year1: 95, year3: 68, year5: 55, year10: 32, year15: 22 },
    { month: 'Apr', year1: 88, year3: 62, year5: 51, year10: 29, year15: 20 },
    { month: 'May', year1: 102, year3: 72, year5: 59, year10: 34, year15: 23 },
    { month: 'Jun', year1: 97, year3: 69, year5: 56, year10: 31, year15: 21 }
  ];

  // Top recognized employees
  const topRecognizedEmployees = [
    { name: 'Sarah Johnson', department: 'Engineering', years: 10, recognitions: 12, lastGift: 'Smart Watch', value: 450 },
    { name: 'Michael Chen', department: 'Sales', years: 8, recognitions: 10, lastGift: 'Wireless Headphones', value: 280 },
    { name: 'Emily Rodriguez', department: 'Marketing', years: 7, recognitions: 9, lastGift: 'Gift Card Bundle', value: 350 },
    { name: 'David Kim', department: 'Operations', years: 12, recognitions: 15, lastGift: 'Travel Voucher', value: 1200 },
    { name: 'Lisa Anderson', department: 'Finance', years: 9, recognitions: 11, lastGift: 'Premium Coffee Set', value: 185 }
  ];

  // Upcoming milestones (next 30 days)
  const upcomingMilestones = [
    { name: 'James Wilson', department: 'Engineering', milestone: '5 Years', date: '2026-02-20', daysAway: 5 },
    { name: 'Anna Martinez', department: 'Sales', milestone: '3 Years', date: '2026-02-22', daysAway: 7 },
    { name: 'Robert Taylor', department: 'Marketing', milestone: '10 Years', date: '2026-02-25', daysAway: 10 },
    { name: 'Jennifer Lee', department: 'Operations', milestone: '1 Year', date: '2026-03-01', daysAway: 15 },
    { name: 'Christopher Brown', department: 'HR', milestone: '7 Years', date: '2026-03-05', daysAway: 19 }
  ];

  // Engagement score breakdown
  const engagementBreakdown = [
    { category: 'Program Awareness', score: 92 },
    { category: 'Gift Selection', score: 88 },
    { category: 'Redemption Process', score: 85 },
    { category: 'Gift Quality', score: 91 },
    { category: 'Personalization', score: 84 },
    { category: 'Overall Satisfaction', score: 89 }
  ];

  const COLORS = ['#D91C81', '#E94B9E', '#F47BB6', '#FF9ECE', '#FFC1E0'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Recognition Analytics</h1>
          <p className="text-gray-600 mt-1">Track milestones, engagement, and program performance</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
            <option value="hr">HR</option>
            <option value="finance">Finance</option>
          </select>

          {/* Milestone Filter */}
          <select
            value={milestoneFilter}
            onChange={(e) => setMilestoneFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
          >
            <option value="all">All Milestones</option>
            <option value="1year">1 Year</option>
            <option value="3years">3 Years</option>
            <option value="5years">5 Years</option>
            <option value="10years">10 Years</option>
            <option value="15years">15+ Years</option>
          </select>

          {/* Time Range */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-[#D91C81] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range === '7d' && '7D'}
                {range === '30d' && '30D'}
                {range === '90d' && '90D'}
                {range === '1y' && '1Y'}
              </button>
            ))}
          </div>

          {/* Export */}
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
            <Users className="w-5 h-5 text-[#D91C81]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{recognitionMetrics.totalEmployees.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+{recognitionMetrics.employeeGrowth}%</span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Recognitions</h3>
            <Award className="w-5 h-5 text-[#E94B9E]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{recognitionMetrics.activeRecognitions.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm font-medium text-gray-900">{recognitionMetrics.participationRate}%</span>
            <span className="text-sm text-gray-500">participation rate</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Program Spend</h3>
            <DollarSign className="w-5 h-5 text-[#F47BB6]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${(recognitionMetrics.totalSpent / 1000000).toFixed(2)}M</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm font-medium text-gray-900">${recognitionMetrics.avgGiftValue}</span>
            <span className="text-sm text-gray-500">avg gift value</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Engagement Score</h3>
            <Heart className="w-5 h-5 text-[#FF9ECE]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{recognitionMetrics.engagementScore.toFixed(1)}/5.0</p>
          <div className="flex items-center gap-1 mt-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{recognitionMetrics.redemptionRate}%</span>
            <span className="text-sm text-gray-500">redemption</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Upcoming Milestones</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{recognitionMetrics.upcomingMilestones}</p>
          <p className="text-sm opacity-90">In the next 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Average Tenure</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{recognitionMetrics.avgTenure} years</p>
          <p className="text-sm opacity-90">Across all employees</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Redemption Rate</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{recognitionMetrics.redemptionRate}%</p>
          <p className="text-sm opacity-90">Gifts claimed</p>
        </div>
      </div>

      {/* Charts Row 1: Timeline & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recognition Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recognition Timeline</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              {/* @ts-expect-error recharts YAxis yAxisId prop not in type defs */}
              <YAxis yAxisId="left" stroke="#9ca3af" />
              {/* @ts-expect-error recharts YAxis yAxisId prop not in type defs */}
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              {/* @ts-expect-error recharts Bar yAxisId prop not in type defs */}
              <Bar yAxisId="left" dataKey="recognitions" fill="#D91C81" radius={[8, 8, 0, 0]} name="Recognitions" />
              {/* @ts-expect-error recharts Line yAxisId prop not in type defs */}
              <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#E94B9E" strokeWidth={3} name="Engagement" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Milestone Distribution</h2>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={milestoneData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ milestone, percentage }) => `${milestone} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {milestoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Departments & Tenure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Department Recognition</h2>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-expect-error recharts BarChart layout prop not in type defs */}
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              {/* @ts-expect-error recharts XAxis type prop not in type defs */}
              <XAxis type="number" stroke="#9ca3af" />
              {/* @ts-expect-error recharts YAxis dataKey/type props not in type defs */}
              <YAxis dataKey="department" type="category" stroke="#9ca3af" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="recognitions" fill="#D91C81" radius={[0, 8, 8, 0]} name="Recognitions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tenure Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tenure Distribution</h2>
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tenureDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Employees">
                {tenureDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Program ROI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recognition Program ROI</h2>
            <p className="text-sm text-gray-600 mt-1">Impact on key business metrics</p>
          </div>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="metric" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar dataKey="baseline" fill="#cbd5e1" radius={[8, 8, 0, 0]} name="Baseline" />
            <Bar dataKey="withProgram" fill="#D91C81" radius={[8, 8, 0, 0]} name="With Program" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Score Radar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Employee Engagement Breakdown</h2>
            <p className="text-sm text-gray-600 mt-1">Program satisfaction across dimensions</p>
          </div>
          <Star className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={engagementBreakdown}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="category" stroke="#6b7280" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
            <Radar name="Score" dataKey="score" stroke="#D91C81" fill="#D91C81" fillOpacity={0.6} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Tables Row: Top Recognized & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recognized Employees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Recognized Employees</h2>
            <p className="text-sm text-gray-600 mt-1">Most milestone celebrations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topRecognizedEmployees.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-[#D91C81] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.years}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.recognitions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Milestones</h2>
            <p className="text-sm text-gray-600 mt-1">Next 30 days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingMilestones.map((milestone, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-[#D91C81] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{milestone.name}</div>
                          <div className="text-xs text-gray-500">{milestone.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {milestone.milestone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{milestone.daysAway} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Department Insights</h2>
          <p className="text-sm text-gray-600 mt-1">Detailed breakdown by department</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recognitions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Tenure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-[#D91C81] mr-3" />
                      <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.employees}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.recognitions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.avgTenure} years</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      dept.participationRate >= 90 ? 'text-green-600' : dept.participationRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {dept.participationRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(dept.totalSpent / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}