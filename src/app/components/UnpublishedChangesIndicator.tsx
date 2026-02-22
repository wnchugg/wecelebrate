import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface UnpublishedChangesIndicatorProps {
  onNavigateToDraft: () => void;
}

export function UnpublishedChangesIndicator({ onNavigateToDraft }: UnpublishedChangesIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors duration-200 flex items-center gap-1.5 px-3 py-1"
            onClick={onNavigateToDraft}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Unpublished Changes
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>You have unpublished changes in draft mode. Click to view and edit.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
