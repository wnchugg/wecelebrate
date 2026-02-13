/**
 * Catalog Migration Page
 * Tool for migrating to multi-catalog architecture
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Database, CheckCircle, AlertTriangle, Play, RotateCcw, Info } from 'lucide-react';
import { checkMigrationStatus, getMigrationStatus, runMigration, rollbackMigration } from '../../services/catalogApi';

export default function CatalogMigration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      setLoading(true);
      setError(null);
      
      const [needsCheck, statusData] = await Promise.all([
        checkMigrationStatus(),
        getMigrationStatus(),
      ]);
      
      setMigrationNeeded(needsCheck.migrationNeeded);
      setMigrationStatus(statusData);
    } catch (err: any) {
      console.error('Error checking migration status:', err);
      setError(err.message || 'Failed to check migration status');
    } finally {
      setLoading(false);
    }
  }

  async function handleRunMigration() {
    if (!confirm('Are you sure you want to run the migration? This will convert all existing products to the multi-catalog structure.')) {
      return;
    }

    try {
      setMigrating(true);
      setError(null);
      setSuccess(null);
      
      const result = await runMigration();
      
      if (result.success) {
        setSuccess(result.message);
        await checkStatus();
      } else {
        setError(result.message || 'Migration failed');
      }
    } catch (err: any) {
      console.error('Error running migration:', err);
      setError(err.message || 'Failed to run migration');
    } finally {
      setMigrating(false);
    }
  }

  async function handleRollback() {
    if (!confirm('⚠️ WARNING: This will remove all catalog configurations and revert products to the old structure. This should only be used in development. Continue?')) {
      return;
    }

    if (!confirm('This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      setRollingBack(true);
      setError(null);
      setSuccess(null);
      
      const result = await rollbackMigration();
      
      if (result.success) {
        setSuccess(result.message + ' (Development Only)');
        await checkStatus();
      } else {
        setError(result.message || 'Rollback failed');
      }
    } catch (err: any) {
      console.error('Error rolling back migration:', err);
      setError(err.message || 'Failed to rollback migration');
    } finally {
      setRollingBack(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/catalogs')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Catalog Migration</h1>
        <p className="text-gray-600 mt-1">
          Migrate existing products to the multi-catalog architecture
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-green-900">Success</div>
            <div className="text-green-700 text-sm mt-1">{success}</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-red-900">Error</div>
            <div className="text-red-700 text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Migration Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-[#D91C81]" />
          <h2 className="text-lg font-semibold text-gray-900">Migration Status</h2>
        </div>

        {migrationStatus && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg ${
              migrationStatus.migrationComplete
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                {migrationStatus.migrationComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Migration Complete</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Migration Needed</span>
                  </>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{migrationStatus.totalCatalogs}</div>
                <div className="text-sm text-gray-600">Catalogs</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{migrationStatus.totalGifts}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{migrationStatus.giftsWithCatalog}</div>
                <div className="text-sm text-gray-600">Migrated</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${
                  migrationStatus.giftsWithoutCatalog > 0 ? 'text-yellow-600' : 'text-gray-900'
                }`}>
                  {migrationStatus.giftsWithoutCatalog}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            {/* Sites Configuration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Site Configuration</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Total Sites</div>
                  <div className="text-lg font-semibold text-gray-900">{migrationStatus.totalSites}</div>
                </div>
                <div>
                  <div className="text-gray-600">Configured</div>
                  <div className="text-lg font-semibold text-green-600">{migrationStatus.sitesConfigured}</div>
                </div>
                <div>
                  <div className="text-gray-600">Pending</div>
                  <div className="text-lg font-semibold text-yellow-600">{migrationStatus.sitesNeedingConfig}</div>
                </div>
              </div>
            </div>

            {/* Catalog IDs */}
            {migrationStatus.catalogIds && migrationStatus.catalogIds.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Existing Catalogs</h3>
                <div className="space-y-1">
                  {migrationStatus.catalogIds.map((id: string) => (
                    <div key={id} className="text-sm text-gray-600 font-mono">
                      {id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimation Notice */}
            {migrationStatus.estimationUsed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  Statistics are estimated based on a sample of {migrationStatus.sampledGifts} products
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* What is Migration? */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">What does migration do?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Creates a "Legacy Catalog" containing all existing products</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Updates all products with catalog linkage and source attribution</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Assigns the legacy catalog to all existing sites</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Enables multi-catalog functionality for future catalog management</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {/* Run Migration */}
        {migrationNeeded && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Run Migration</h3>
                <p className="text-sm text-gray-600">
                  Convert your existing products to the multi-catalog structure. This is safe to run and will not delete any data.
                </p>
              </div>
              <button
                onClick={handleRunMigration}
                disabled={migrating}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Play className="w-5 h-5" />
                {migrating ? 'Migrating...' : 'Run Migration'}
              </button>
            </div>
          </div>
        )}

        {/* Rollback (Development Only) */}
        {!migrationNeeded && import.meta.env.DEV && (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Rollback Migration <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">DEV ONLY</span>
                </h3>
                <p className="text-sm text-red-600">
                  ⚠️ WARNING: This will remove all catalog configurations and revert to the old structure. Use only for testing.
                </p>
              </div>
              <button
                onClick={handleRollback}
                disabled={rollingBack}
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <RotateCcw className="w-5 h-5" />
                {rollingBack ? 'Rolling Back...' : 'Rollback'}
              </button>
            </div>
          </div>
        )}

        {/* Refresh Status */}
        <div className="flex justify-center">
          <button
            onClick={() => { setChecking(true); checkStatus().finally(() => setChecking(false)); }}
            disabled={checking}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
