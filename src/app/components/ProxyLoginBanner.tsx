/**
 * Proxy Login Banner Component
 * Displays a prominent banner when an admin is viewing the site as an employee
 */

import { useState, useEffect } from 'react';
import { UserCheck, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNameFormat } from '../hooks/useNameFormat';

interface ProxyLoginBannerProps {
  employeeName: string;
  employeeFirstName: string;
  employeeLastName: string;
  expiresAt: Date;
  onEndSession: () => void;
}

export function ProxyLoginBanner({
  employeeName,
  employeeFirstName,
  employeeLastName,
  expiresAt,
  onEndSession,
}: ProxyLoginBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const { formatFullName } = useNameFormat();

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const displayName = employeeName || formatFullName(employeeFirstName, employeeLastName);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                Viewing as {displayName}
              </p>
              <p className="text-sm text-amber-100">
                Read-only mode • Session expires in {timeRemaining}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onEndSession}
            className="bg-white text-amber-600 hover:bg-amber-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            End Session
          </Button>
        </div>
      </div>
    </div>
  );
}
