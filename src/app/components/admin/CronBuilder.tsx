import React, { useState, useEffect } from 'react';
import { Clock, Info } from 'lucide-react';

interface CronBuilderProps {
  value: string;
  onChange: (expression: string) => void;
  timezone?: string;
  onTimezoneChange?: (timezone: string) => void;
}

export function CronBuilder({ value, onChange, timezone = 'UTC', onTimezoneChange }: CronBuilderProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [description, setDescription] = useState('');
  
  // Cron parts
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('0');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');

  // Common presets
  const presets = [
    { label: 'Every 15 minutes', value: '*/15 * * * *', description: 'Runs every 15 minutes' },
    { label: 'Every 30 minutes', value: '*/30 * * * *', description: 'Runs every 30 minutes' },
    { label: 'Every hour', value: '0 * * * *', description: 'Runs at the start of every hour' },
    { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Runs every 6 hours at minute 0' },
    { label: 'Every 12 hours', value: '0 */12 * * *', description: 'Runs twice daily at midnight and noon' },
    { label: 'Daily at midnight', value: '0 0 * * *', description: 'Runs once per day at 12:00 AM' },
    { label: 'Daily at 2 AM', value: '0 2 * * *', description: 'Runs once per day at 2:00 AM' },
    { label: 'Daily at noon', value: '0 12 * * *', description: 'Runs once per day at 12:00 PM' },
    { label: 'Twice daily (2 AM & 2 PM)', value: '0 2,14 * * *', description: 'Runs at 2:00 AM and 2:00 PM' },
    { label: 'Weekly on Sunday', value: '0 0 * * 0', description: 'Runs every Sunday at midnight' },
    { label: 'Weekly on Monday', value: '0 0 * * 1', description: 'Runs every Monday at midnight' },
    { label: 'Monthly on 1st', value: '0 0 1 * *', description: 'Runs on the 1st of each month at midnight' },
  ];

  // Parse existing cron expression
  useEffect(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length === 5) {
        setMinute(parts[0]);
        setHour(parts[1]);
        setDay(parts[2]);
        setMonth(parts[3]);
        setDayOfWeek(parts[4]);
        
        // Check if it matches a preset
        const preset = presets.find(p => p.value === value);
        if (preset) {
          setMode('preset');
          setDescription(preset.description);
        } else {
          setMode('custom');
          generateDescription(value);
        }
      }
    }
  }, [value]);

  const generateDescription = (expr: string) => {
    const parts = expr.split(' ');
    if (parts.length !== 5) {
      setDescription('Invalid expression');
      return;
    }

    const [m, h, d, mo, dw] = parts;
    let desc = 'At ';

    // Minute
    if (m === '*') desc += 'every minute';
    else if (m.startsWith('*/')) desc += `every ${m.substring(2)} minutes`;
    else desc += `minute ${m}`;

    desc += ' of ';

    // Hour
    if (h === '*') desc += 'every hour';
    else if (h.startsWith('*/')) desc += `every ${h.substring(2)} hours`;
    else if (h.includes(',')) desc += `hours ${h}`;
    else desc += `hour ${h}`;

    // Day
    if (d !== '*') {
      desc += ` on day ${d} of the month`;
    }

    // Month
    if (mo !== '*') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNum = parseInt(mo);
      if (monthNum >= 1 && monthNum <= 12) {
        desc += ` in ${months[monthNum - 1]}`;
      }
    }

    // Day of week
    if (dw !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayNum = parseInt(dw);
      if (dayNum >= 0 && dayNum <= 6) {
        desc += ` on ${days[dayNum]}`;
      }
    }

    setDescription(desc);
  };

  const handlePresetChange = (preset: string) => {
    onChange(preset);
    const presetObj = presets.find(p => p.value === preset);
    if (presetObj) {
      setDescription(presetObj.description);
    }
  };

  const handleCustomChange = () => {
    const expr = `${minute} ${hour} ${day} ${month} ${dayOfWeek}`;
    onChange(expr);
    generateDescription(expr);
  };

  useEffect(() => {
    if (mode === 'custom') {
      handleCustomChange();
    }
  }, [minute, hour, day, month, dayOfWeek, mode]);

  // Common timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('preset')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'preset'
              ? 'bg-[#D91C81] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Common Presets
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'custom'
              ? 'bg-[#D91C81] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom Expression
        </button>
      </div>

      {/* Preset Mode */}
      {mode === 'preset' && (
        <div className="space-y-3">
          {presets.map((preset) => (
            <label
              key={preset.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                value === preset.value
                  ? 'border-[#D91C81] bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="sr-only">{preset.label}</span>
              <input
                type="radio"
                name="preset"
                value={preset.value}
                checked={value === preset.value}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="mt-1 text-[#D91C81] focus:ring-[#D91C81]"
              />
              <div className="flex-1">
                <div className="font-medium text-[#1B2A5E]">{preset.label}</div>
                <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                  {preset.value}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Custom Mode */}
      {mode === 'custom' && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {/* Minute */}
            <div>
              <label htmlFor="cron-minute" className="block text-sm font-medium text-gray-700 mb-2">
                Minute
                <span className="block text-xs text-gray-500 font-normal mt-1">0-59</span>
              </label>
              <input
                id="cron-minute"
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm font-mono"
              />
            </div>

            {/* Hour */}
            <div>
              <label htmlFor="cron-hour" className="block text-sm font-medium text-gray-700 mb-2">
                Hour
                <span className="block text-xs text-gray-500 font-normal mt-1">0-23</span>
              </label>
              <input
                id="cron-hour"
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm font-mono"
              />
            </div>

            {/* Day */}
            <div>
              <label htmlFor="cron-day" className="block text-sm font-medium text-gray-700 mb-2">
                Day
                <span className="block text-xs text-gray-500 font-normal mt-1">1-31</span>
              </label>
              <input
                id="cron-day"
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm font-mono"
              />
            </div>

            {/* Month */}
            <div>
              <label htmlFor="cron-month" className="block text-sm font-medium text-gray-700 mb-2">
                Month
                <span className="block text-xs text-gray-500 font-normal mt-1">1-12</span>
              </label>
              <input
                id="cron-month"
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm font-mono"
              />
            </div>

            {/* Day of Week */}
            <div>
              <label htmlFor="cron-dow" className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
                <span className="block text-xs text-gray-500 font-normal mt-1">0-6</span>
              </label>
              <input
                id="cron-dow"
                type="text"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                placeholder="*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm font-mono"
              />
            </div>
          </div>

          {/* Helper */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Supported patterns:</p>
                <ul className="space-y-1">
                  <li><code className="bg-white px-1 py-0.5 rounded">*</code> - Any value</li>
                  <li><code className="bg-white px-1 py-0.5 rounded">*/n</code> - Every n units (e.g., */15 for every 15 minutes)</li>
                  <li><code className="bg-white px-1 py-0.5 rounded">n</code> - Specific value (e.g., 5 for 5th minute)</li>
                  <li><code className="bg-white px-1 py-0.5 rounded">n,m</code> - Multiple values (e.g., 1,15 for 1st and 15th)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timezone Selection */}
      {onTimezoneChange && (
        <div>
          <label htmlFor="cron-timezone" className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            id="cron-timezone"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Expression & Description */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#D91C81] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-1">Cron Expression:</div>
            <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border border-gray-200 mb-3">
              {value || '0 0 * * *'}
            </div>
            {description && (
              <>
                <div className="text-sm font-medium text-gray-700 mb-1">Schedule:</div>
                <div className="text-sm text-gray-900 bg-green-50 px-3 py-2 rounded border border-green-200">
                  {description}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CronBuilder;
