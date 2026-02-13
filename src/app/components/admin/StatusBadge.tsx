export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'custom';
  color?: {
    bg: string;
    text: string;
    border: string;
  };
}

export function StatusBadge({ status, variant = 'default', color }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'active':
      case 'delivered':
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      
      case 'inactive':
      case 'disabled':
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      
      case 'cancelled':
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      
      case 'draft':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatusText = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (variant === 'custom' && color) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color.bg} ${color.text} ${color.border}`}
      >
        {formatStatusText(status)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(
        status
      )}`}
    >
      {formatStatusText(status)}
    </span>
  );
}
