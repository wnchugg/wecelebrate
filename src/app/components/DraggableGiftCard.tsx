import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { logger } from '../utils/logger';

const ITEM_TYPE = 'GIFT_CARD';

interface Gift {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sku: string;
  price: number;
  status: string;
}

interface DragItem {
  id: string;
  index: number;
}

interface DragCollectedProps {
  handlerId: string | symbol | null;
}

interface DropCollectedProps {
  isDragging: boolean;
}

export interface DraggableGiftCardProps {
  gift: Gift;
  index: number;
  moveGift: (dragIndex: number, hoverIndex: number) => void;
  onEdit?: (gift: Gift) => void;
  onDelete?: (giftId: string) => void;
  onPreview?: (gift: Gift) => void;
  onRemove?: (giftId: string) => void;
  showRemove?: boolean;
}

export function DraggableGiftCard({
  gift,
  index,
  moveGift,
  onEdit,
  onDelete,
  onPreview,
}: DraggableGiftCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  logger.debug('[DraggableGiftCard] Rendering card', { giftName: gift.name, index });

  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveGift(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      logger.debug('[DraggableGiftCard] Starting drag', { giftName: gift.name, index });
      return { id: gift.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      logger.debug('[DraggableGiftCard] Drag ended', { giftName: gift.name });
    }
  });

  const opacity = isDragging ? 0.4 : 1;
  
  // Combine drag and drop on the same element - entire card is draggable
  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity }}
      className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-[#D91C81] transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div 
          className="cursor-move text-gray-400 hover:text-[#D91C81] transition-colors mt-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Gift Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{gift.name}</h4>
            {onDelete && (
              <button
                onClick={() => onDelete(gift.id)}
                className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{gift.description}</p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">{gift.category}</Badge>
            <span className="text-xs font-mono text-gray-500">{gift.sku}</span>
            <span className="text-sm font-semibold text-[#D91C81]">${gift.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}