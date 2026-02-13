import { Badge } from './ui/badge';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export function EnvironmentBadge() {
  const currentEnv = getCurrentEnvironment();

  // Use the color scheme from the deployment environment
  let badgeClasses = '';
  
  switch (currentEnv.id) {
    case 'development':
      badgeClasses = 'bg-green-100 text-green-800 hover:bg-green-100 border border-green-300';
      break;
    case 'test':
      badgeClasses = 'bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300';
      break;
    case 'uat':
      badgeClasses = 'bg-purple-100 text-purple-800 hover:bg-purple-100 border border-purple-300';
      break;
    case 'production':
      badgeClasses = 'bg-red-100 text-red-800 hover:bg-red-100 border border-red-300';
      break;
  }

  return (
    <Badge variant="secondary" className={badgeClasses}>
      {currentEnv.label}
    </Badge>
  );
}