import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Trash2, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseStats {
  kvStoreRecords: number;
  timestamp: string;
}

interface KeyDistribution {
  [prefix: string]: number;
}

export function DatabaseCleanupPanel() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [distribution, setDistribution] = useState<KeyDistribution>({});
  const [analyzing, setAnalyzing] = useState(false);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'lmffeqwhrnbsbhdztwyv';
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

  const fetchStats = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${baseUrl}/admin/database/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setDistribution(data.distribution);
        toast.success('Database statistics loaded');
      } else {
        toast.error('Failed to load statistics');
      }
    } catch (error) {
      toast.error('Error fetching stats');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm('This will delete all test and demo data. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/admin/database/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daysToKeep: 7 }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Deleted ${data.results.deleted} records`);
        fetchStats(); // Refresh stats
      } else {
        toast.error('Cleanup failed');
      }
    } catch (error) {
      toast.error('Error running cleanup');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deletePrefix = async (prefix: string) => {
    if (!confirm(`Delete all keys starting with "${prefix}:"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/admin/database/prefix/${prefix}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Deleted ${data.deleted} records with prefix "${prefix}:"`);
        fetchStats(); // Refresh stats
      } else {
        toast.error('Delete failed');
      }
    } catch (error) {
      toast.error('Error deleting prefix');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRecords = () => {
    return Object.values(distribution).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Database Cleanup & Monitoring
          </CardTitle>
          <CardDescription>
            Manage database size and clean up old data to prevent resource exhaustion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Free tier limit: 500MB. Monitor usage regularly to prevent service disruption.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={fetchStats}
              disabled={analyzing}
              variant="outline"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Database
                </>
              )}
            </Button>

            <Button
              onClick={runCleanup}
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clean Test Data
            </Button>
          </div>

          {stats && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getTotalRecords().toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Storage Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getTotalRecords() > 10000 ? (
                        <Badge variant="destructive">High Usage</Badge>
                      ) : getTotalRecords() > 5000 ? (
                        <Badge variant="secondary">Moderate</Badge>
                      ) : (
                        <Badge variant="default">Healthy</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor when &gt; 10,000 records
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Key Distribution by Prefix</h3>
                <div className="space-y-2">
                  {Object.entries(distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([prefix, count]) => (
                      <div
                        key={prefix}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {prefix}:
                          </code>
                          <span className="text-sm text-muted-foreground">
                            {count.toLocaleString()} records
                          </span>
                        </div>
                        {(prefix === 'test' || prefix === 'demo') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePrefix(prefix)}
                            disabled={loading}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Manual Cleanup Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Run these SQL queries in the Supabase SQL Editor for manual cleanup:
          </p>
          
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold mb-2">Delete test data:</p>
              <code className="text-xs">
                DELETE FROM kv_store_6fcaeea3 WHERE key LIKE 'test:%';
              </code>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold mb-2">Delete demo data:</p>
              <code className="text-xs">
                DELETE FROM kv_store_6fcaeea3 WHERE key LIKE 'demo:%';
              </code>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold mb-2">Check table size:</p>
              <code className="text-xs">
                SELECT COUNT(*) FROM kv_store_6fcaeea3;
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}