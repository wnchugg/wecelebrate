/**
 * Dashboard with Error Boundary
 * 
 * Wraps the Dashboard component with error boundary for production safety
 */

import { DashboardErrorBoundary } from '../../components/DashboardErrorBoundary';
import { Dashboard } from './Dashboard';

export function DashboardWithErrorBoundary() {
  return (
    <DashboardErrorBoundary>
      <Dashboard />
    </DashboardErrorBoundary>
  );
}

export default DashboardWithErrorBoundary;
