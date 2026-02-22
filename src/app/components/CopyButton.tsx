import { useState } from 'react';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export interface CopyButtonProps {
  text: string;
  onCopySuccess?: () => void;
  onCopyFail?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  className?: string;
  iconOnly?: boolean;
  successMessage?: string;
}

export function CopyButton({
  text,
  onCopySuccess,
  onCopyFail,
  size = 'md',
  variant = 'ghost',
  className = '',
  iconOnly = true,
  successMessage = 'Copied!',
}: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = async () => {
    const result = await copyToClipboard(text);

    if (result.success) {
      setStatus('success');
      onCopySuccess?.();
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      onCopyFail?.(result.error || 'Copy failed');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Variant classes
  const variantClasses = {
    ghost: 'hover:bg-gray-100 active:bg-gray-200',
    outline: 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    solid: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  };

  // Status-based styling
  const statusClasses = {
    idle: '',
    success: 'text-green-600',
    error: 'text-red-600',
  };

  return (
    <button
      onClick={() => void handleCopy()}
      className={`
        inline-flex items-center gap-1.5 rounded transition-all
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${statusClasses[status]}
        ${className}
      `}
      title={status === 'success' ? successMessage : 'Copy to clipboard'}
      disabled={status !== 'idle'}
    >
      {status === 'idle' && <Copy className={iconSizes[size]} />}
      {status === 'success' && <CheckCircle className={iconSizes[size]} />}
      {status === 'error' && <AlertCircle className={iconSizes[size]} />}
      
      {!iconOnly && (
        <span className="font-medium">
          {status === 'idle' && 'Copy'}
          {status === 'success' && successMessage}
          {status === 'error' && 'Failed'}
        </span>
      )}
    </button>
  );
}

interface CopyCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

/**
 * A code block with built-in copy functionality
 */
export function CopyCodeBlock({
  code,
  language = 'bash',
  showLineNumbers = false,
  className = '',
}: CopyCodeBlockProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const lines = code.split('\n');

  return (
    <div className={`relative group ${className}`}>
      {/* Copy Button - Top Right */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <CopyButton
          text={code}
          variant="solid"
          size="sm"
          onCopySuccess={() => setCopyStatus('success')}
          onCopyFail={() => setCopyStatus('error')}
          iconOnly={false}
        />
      </div>

      {/* Code Block */}
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
        {showLineNumbers ? (
          <div className="flex">
            {/* Line Numbers */}
            <div className="text-gray-500 select-none pr-4 text-right">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <code className="flex-1">{code}</code>
          </div>
        ) : (
          <code>{code}</code>
        )}
      </pre>

      {/* Status Message */}
      {copyStatus !== 'idle' && (
        <div className="absolute bottom-2 right-2">
          <div
            className={`
              px-2 py-1 rounded text-xs font-medium
              ${copyStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}
          >
            {copyStatus === 'success' ? '✓ Copied!' : '✗ Failed - Select manually'}
          </div>
        </div>
      )}
    </div>
  );
}