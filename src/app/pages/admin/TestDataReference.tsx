import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Database, 
  Users, 
  Building2, 
  Globe, 
  Gift, 
  CreditCard, 
  Mail, 
  IdCard, 
  Link as LinkIcon,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function TestDataReference() {
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const testScenarios = [
    {
      id: 'email-validation',
      title: 'Email Validation Flow',
      site: 'TechCorp US - Employee Gifts 2026',
      siteId: 'site-001',
      validationMethod: 'Email',
      testAccounts: [
        { email: 'john.smith@techcorp.com', name: 'John Smith', status: 'Available' },
        { email: 'sarah.johnson@techcorp.com', name: 'Sarah Johnson', status: 'Available' },
        { email: 'michael.chen@techcorp.com', name: 'Michael Chen', status: 'Already Ordered' },
      ],
      steps: [
        'Go to the Landing page',
        'Select "TechCorp US" site',
        'Enter one of the test emails',
        'Receive validation code (check console in dev)',
        'Select a gift from the catalog',
        'Complete shipping information',
        'Review and confirm order',
      ],
    },
    {
      id: 'employee-id',
      title: 'Employee ID Validation Flow',
      site: 'TechCorp Asia Pacific',
      siteId: 'site-003',
      validationMethod: 'Employee ID',
      testAccounts: [
        { employeeId: 'TC-APAC-001', name: 'Wei Zhang', email: 'wei.zhang@techcorp.sg', status: 'Available' },
        { employeeId: 'TC-APAC-002', name: 'Yuki Tanaka', email: 'yuki.tanaka@techcorp.jp', status: 'Available' },
      ],
      steps: [
        'Go to the Landing page',
        'Select "TechCorp Asia Pacific" site',
        'Enter employee ID and last name',
        'Select up to 2 gifts (giftsPerUser: 2)',
        'Shipping will be to company address (company shipping mode)',
        'Review and confirm order',
      ],
    },
    {
      id: 'serial-card',
      title: 'Serial Card Validation Flow',
      site: 'GlobalRetail Essentials',
      siteId: 'site-005',
      validationMethod: 'Serial Card',
      testAccounts: [
        { serialNumber: 'GR-2026-0001', status: 'Available' },
        { serialNumber: 'GR-2026-0002', status: 'Available' },
        { serialNumber: 'GR-2026-0003', status: 'Already Used' },
        { serialNumber: 'GR-2026-0004', status: 'Available' },
      ],
      steps: [
        'Go to the Landing page',
        'Select "GlobalRetail Essentials" site',
        'Enter serial card number',
        'Select a gift (Basic price level only)',
        'Select store pickup location',
        'Review and confirm order',
      ],
    },
    {
      id: 'magic-link',
      title: 'Magic Link Validation Flow',
      site: 'EduTech - Campus Rewards',
      siteId: 'site-007',
      validationMethod: 'Magic Link',
      testAccounts: [
        { email: 'alex.martinez@edutech.com', name: 'Alex Martinez', status: 'Available' },
        { email: 'jessica.kim@edutech.com', name: 'Jessica Kim', status: 'Available' },
      ],
      steps: [
        'Go to the Landing page',
        'Select "EduTech Campus Rewards" site',
        'Enter email address',
        'Request magic link (check console in dev)',
        'Click magic link to validate',
        'Select up to 2 gifts',
        'Complete shipping information',
        'Review and confirm order',
      ],
    },
  ];

  const clients = [
    { id: 'client-001', name: 'TechCorp Inc.', sites: 3, status: 'active' },
    { id: 'client-002', name: 'GlobalRetail Group', sites: 2, status: 'active' },
    { id: 'client-003', name: 'HealthCare Services Ltd.', sites: 1, status: 'active' },
    { id: 'client-004', name: 'EduTech Solutions', sites: 1, status: 'active' },
  ];

  const allEmployees = [
    { id: 'emp-001', email: 'john.smith@techcorp.com', empId: 'TC-001', site: 'site-001', hasOrdered: false },
    { id: 'emp-002', email: 'sarah.johnson@techcorp.com', empId: 'TC-002', site: 'site-001', hasOrdered: false },
    { id: 'emp-003', email: 'michael.chen@techcorp.com', empId: 'TC-003', site: 'site-001', hasOrdered: true },
    { id: 'emp-004', email: 'anna.mueller@techcorp.de', empId: 'TC-EU-001', site: 'site-002', hasOrdered: false },
    { id: 'emp-005', email: 'pierre.dupont@techcorp.fr', empId: 'TC-EU-002', site: 'site-002', hasOrdered: false },
    { id: 'emp-006', email: 'wei.zhang@techcorp.sg', empId: 'TC-APAC-001', site: 'site-003', hasOrdered: false },
    { id: 'emp-007', email: 'yuki.tanaka@techcorp.jp', empId: 'TC-APAC-002', site: 'site-003', hasOrdered: false },
    { id: 'emp-008', email: 'robert.williams@globalretail.com', empId: 'GR-PM-001', site: 'site-004', hasOrdered: false },
    { id: 'emp-009', email: 'lisa.anderson@globalretail.com', empId: 'GR-PM-002', site: 'site-004', hasOrdered: false },
    { id: 'emp-010', email: 'alex.martinez@edutech.com', empId: 'EDU-001', site: 'site-007', hasOrdered: false },
    { id: 'emp-011', email: 'jessica.kim@edutech.com', empId: 'EDU-002', site: 'site-007', hasOrdered: false },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Data Reference</h1>
          <p className="text-gray-600 mt-1">
            Complete guide to testing the 6-step gifting flow with sample data
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reseed Database
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D91C81]">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Sites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B2A5E]">7</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00B4CC]">{allEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Gifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D91C81]">10</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="cards">Serial Cards</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Alert className="border-[#D91C81] bg-pink-50">
            <Database className="w-4 h-4 text-[#D91C81]" />
            <AlertDescription className="text-gray-800">
              <strong>Database Status:</strong> Seeded with comprehensive test data including 4 clients, 7 sites, 11 employees, 8 serial cards, and 10 gifts.
              All validation methods are configured and ready to test.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>6-Step Gifting Flow</CardTitle>
              <CardDescription>The complete employee journey from validation to confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Landing Page', desc: 'Employee arrives at the branded site' },
                  { step: 2, title: 'Access Validation', desc: 'Verify identity (email, employee ID, serial card, or magic link)' },
                  { step: 3, title: 'Gift Selection', desc: 'Browse and select from available gifts' },
                  { step: 4, title: 'Gift Details', desc: 'View product details and add to cart' },
                  { step: 5, title: 'Shipping Information', desc: 'Provide delivery details' },
                  { step: 6, title: 'Review & Confirmation', desc: 'Confirm order and receive confirmation' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#D91C81] text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation Methods</CardTitle>
              <CardDescription>Four different ways to verify employee access</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-[#D91C81] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-[#D91C81]" />
                  <h4 className="font-semibold">Email Validation</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Employee enters email, receives validation code</p>
                <Badge variant="outline">site-001, site-002</Badge>
              </div>
              <div className="p-4 border-2 border-[#1B2A5E] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <IdCard className="w-5 h-5 text-[#1B2A5E]" />
                  <h4 className="font-semibold">Employee ID</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Validate using employee ID + last name</p>
                <Badge variant="outline">site-003, site-004</Badge>
              </div>
              <div className="p-4 border-2 border-[#00B4CC] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-[#00B4CC]" />
                  <h4 className="font-semibold">Serial Card</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Enter unique serial number from gift card</p>
                <Badge variant="outline">site-005, site-006</Badge>
              </div>
              <div className="p-4 border-2 border-[#8B5CF6] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-5 h-5 text-[#8B5CF6]" />
                  <h4 className="font-semibold">Magic Link</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Receive secure link via email to access site</p>
                <Badge variant="outline">site-007</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          {testScenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {scenario.validationMethod === 'Email' && <Mail className="w-5 h-5 text-[#D91C81]" />}
                      {scenario.validationMethod === 'Employee ID' && <IdCard className="w-5 h-5 text-[#1B2A5E]" />}
                      {scenario.validationMethod === 'Serial Card' && <CreditCard className="w-5 h-5 text-[#00B4CC]" />}
                      {scenario.validationMethod === 'Magic Link' && <LinkIcon className="w-5 h-5 text-[#8B5CF6]" />}
                      {scenario.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <span className="font-semibold">{scenario.site}</span> • {scenario.validationMethod}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{scenario.siteId}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Accounts */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Test Accounts
                  </h4>
                  <div className="space-y-2">
                    {scenario.testAccounts.map((account: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          {account.email && (
                            <div className="font-mono text-sm text-gray-900">{account.email}</div>
                          )}
                          {account.employeeId && (
                            <div className="font-mono text-sm text-gray-900">ID: {account.employeeId}</div>
                          )}
                          {account.serialNumber && (
                            <div className="font-mono text-sm text-gray-900">{account.serialNumber}</div>
                          )}
                          {account.name && (
                            <div className="text-sm text-gray-600">{account.name}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.status === 'Available' ? 'default' : 'secondary'}>
                            {account.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              account.email || account.employeeId || account.serialNumber,
                              'Credentials'
                            )}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Steps */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Testing Steps
                  </h4>
                  <ol className="space-y-2">
                    {scenario.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#D91C81] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t flex gap-2">
                  <Button className="bg-[#D91C81] hover:bg-[#B01669]">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test This Flow
                  </Button>
                  <Button variant="outline">View Site Config</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Test Employees</CardTitle>
              <CardDescription>Complete list of seeded employees across all sites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-mono text-sm text-gray-900">{emp.email}</div>
                      <div className="text-sm text-gray-600">
                        Employee ID: {emp.empId} • Site: {emp.site}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {emp.hasOrdered ? (
                        <Badge variant="secondary">Ordered</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">Available</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(emp.email, 'Email')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serial Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Serial Card Numbers</CardTitle>
              <CardDescription>Test serial numbers for card validation flows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">GlobalRetail Essentials (site-005)</h4>
                  <div className="space-y-2">
                    {['GR-2026-0001', 'GR-2026-0002', 'GR-2026-0003', 'GR-2026-0004', 'GR-2026-0005'].map((card, idx) => (
                      <div key={card} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="font-mono text-sm text-gray-900">{card}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={card === 'GR-2026-0003' ? 'secondary' : 'default'}>
                            {card === 'GR-2026-0003' ? 'Used' : 'Available'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(card, 'Serial Number')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">HealthCare Services (site-006)</h4>
                  <div className="space-y-2">
                    {['HC-2025-0001', 'HC-2025-0002', 'HC-2025-0003'].map((card) => (
                      <div key={card} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="font-mono text-sm text-gray-900">{card}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Available</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(card, 'Serial Number')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sites Tab */}
        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sites Configuration</CardTitle>
              <CardDescription>Overview of all seeded sites and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'site-001', name: 'TechCorp US - Employee Gifts 2026', validation: 'email', gifts: 5, status: 'active' },
                  { id: 'site-002', name: 'TechCorp EU - Employee Recognition', validation: 'email', gifts: 6, status: 'active' },
                  { id: 'site-003', name: 'TechCorp Asia Pacific', validation: 'employeeId', gifts: 4, status: 'active' },
                  { id: 'site-004', name: 'GlobalRetail Premium - US', validation: 'employeeId', gifts: 9, status: 'active' },
                  { id: 'site-005', name: 'GlobalRetail Essentials', validation: 'serialCard', gifts: 3, status: 'active' },
                  { id: 'site-006', name: 'HealthCare Services Recognition', validation: 'serialCard', gifts: 0, status: 'inactive' },
                  { id: 'site-007', name: 'EduTech - Campus Rewards', validation: 'magic_link', gifts: 4, status: 'active' },
                ].map((site) => (
                  <div key={site.id} className="p-4 border rounded-lg hover:border-[#D91C81] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{site.name}</h4>
                        <p className="text-sm text-gray-600">Site ID: {site.id}</p>
                      </div>
                      <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                        {site.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Validation: <strong>{site.validation}</strong></span>
                      <span>•</span>
                      <span>Gifts: <strong>{site.gifts}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}