import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { getEmailServiceStatus, sendTestEmail } from '../../services/emailTemplateApi';
import { useEmailTemplate } from '../../context/EmailTemplateContext';

export function EmailServiceTest() {
  const { globalTemplates } = useEmailTemplate();
  const [emailStatus, setEmailStatus] = useState<{
    configured: boolean;
    provider: string;
    defaultFrom: string;
  } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkEmailStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await getEmailServiceStatus();
      setEmailStatus(status);
      if (status.configured) {
        toast.success('Email service is configured and ready');
      } else {
        toast.error('Email service is not configured. Please set RESEND_API_KEY.');
      }
    } catch (error: unknown) {
      toast.error('Failed to check email service status');
      console.error(error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendTestEmail(selectedTemplate, testEmail);
      if (result.success) {
        toast.success(`Test email sent to ${testEmail}!`);
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Service Testing</h1>
        <p className="text-gray-600">
          Test email functionality and verify Resend API configuration
        </p>
      </div>

      {/* Email Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Service Status
          </CardTitle>
          <CardDescription>
            Check if the email service (Resend API) is properly configured
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {emailStatus.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {emailStatus.configured ? 'Configured' : 'Not Configured'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {emailStatus.configured
                        ? 'Email service is ready to send emails'
                        : 'RESEND_API_KEY environment variable not set'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={emailStatus.configured ? 'default' : 'destructive'}
                  className={emailStatus.configured ? 'bg-green-600' : ''}
                >
                  {emailStatus.configured ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {emailStatus.configured && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-gray-600 mb-1">Provider</p>
                    <p className="font-medium text-gray-900">{emailStatus.provider}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-gray-600 mb-1">Default From</p>
                    <p className="font-medium text-gray-900 text-xs">{emailStatus.defaultFrom}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">Click button below to check status</p>
          )}

          <Button
            onClick={checkEmailStatus}
            disabled={isCheckingStatus}
            className="w-full bg-[#D91C81] hover:bg-[#B01566] text-white"
          >
            {isCheckingStatus ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Check Email Service Status
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Send Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email using one of the global templates to verify everything works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-email">Recipient Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your email address to receive the test email
            </p>
          </div>

          <div>
            <Label htmlFor="template-select">Select Template</Label>
            <select
              id="template-select"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="">Choose a template...</option>
              {globalTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select which template to test. Sample data will be used for variables.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> The test email will use sample/placeholder data for all template
              variables. This is to verify the email service is working correctly.
            </p>
          </div>

          <Button
            onClick={handleSendTest}
            disabled={isSending || !emailStatus?.configured || !testEmail || !selectedTemplate}
            className="w-full bg-[#D91C81] hover:bg-[#B01566] text-white"
          >
            {isSending ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>

          {!emailStatus?.configured && (
            <p className="text-sm text-red-600 text-center">
              Email service must be configured before sending test emails
            </p>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {emailStatus && !emailStatus.configured && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>To enable email functionality:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Sign up for a free Resend account at{' '}
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D91C81] hover:underline font-medium"
                  >
                    resend.com
                  </a>
                </li>
                <li>Generate an API key from your Resend dashboard</li>
                <li>Add the API key as <code className="bg-white px-2 py-0.5 rounded border">RESEND_API_KEY</code> in your Supabase environment variables</li>
                <li>Restart your edge function (server will automatically pick up the new key)</li>
              </ol>
              <p className="pt-2">
                Once configured, the email service will be ready to send transactional emails, notifications, and reminders.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}