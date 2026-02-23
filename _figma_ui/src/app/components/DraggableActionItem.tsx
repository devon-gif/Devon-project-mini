import { forwardRef, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from "framer-motion";
import {
  GripVertical, AlarmClock, X, Zap,
} from 'lucide-react';

const ITEM_TYPE = 'DO_NEXT_ACTION';

interface ActionItem {
  id: string;
  action: string;
  contact: string;
  account: string;
  reason: string;
  type: 'call' | 'email' | 'video' | 'intro';
  priority: 'hot' | 'warm' | 'cool';
  personId?: string;
}

interface DraggableActionItemProps {
  action: ActionItem;
  index: number;
  groupId: string;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDoIt: (id: string) => void;
  onDismiss: (id: string) => void;
}

interface DragItem {
  id: string;
  index: number;
  groupId: string;
}

export const DraggableActionItem = forwardRef<HTMLDivElement, DraggableActionItemProps>(
  function DraggableActionItem({ action, index, groupId, moveItem, onDoIt, onDismiss }, forwardedRef) {
    const internalRef = useRef<HTMLDivElement>(null);

    // Merge the forwarded ref (from AnimatePresence) with our internal ref
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    const [{ isDragging }, drag, preview] = useDrag({
      type: ITEM_TYPE,
      item: (): DragItem => ({ id: action.id, index, groupId }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
      accept: ITEM_TYPE,
      hover(item, monitor) {
        // Only allow reorder within the same priority group
        if (item.groupId !== groupId) return;
        if (!internalRef.current) return;

        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverRect = internalRef.current.getBoundingClientRect();
        const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverRect.top;

        // Only move when the cursor has crossed half of the item height
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        moveItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
      canDrop: (item) => item.groupId === groupId,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    // Chain: preview wraps drop wraps mergedRef
    const setNodeRef = useCallback(
      (node: HTMLDivElement | null) => {
        mergedRef(node);
        drop(node);
        preview(node);
      },
      [mergedRef, drop, preview],
    );

    return (
      <motion.div
        ref={setNodeRef}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isDragging ? 0.4 : 1, x: 0, scale: isDragging ? 1.02 : 1 }}
        exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.25, ease: 'easeIn' } }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`group flex items-center gap-2 rounded-xl border px-3 py-3 transition-[background-color,border-color,box-shadow] ${
          isDragging
            ? 'border-[#FFD600] bg-[#FFD600]/5 shadow-lg'
            : isOver && canDrop
              ? 'border-blue-200 bg-blue-50/30'
              : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
        }`}
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      >
        {/* Drag handle */}
        <div
          ref={(node) => { drag(node); }}
          className="flex h-7 w-5 shrink-0 items-center justify-center rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Priority dot */}
        <div className={`h-2 w-2 shrink-0 rounded-full ${
          action.priority === 'hot' ? 'bg-red-400' :
          action.priority === 'warm' ? 'bg-amber-400' : 'bg-gray-300'
        }`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-800">{action.action}</span>
            <span className="text-[11px] text-gray-400">&middot;</span>
            <span className="text-xs text-[#2563EB]">{action.contact}</span>
            <span className="text-[11px] text-gray-400">&middot;</span>
            <span className="text-[11px] text-gray-400">{action.account}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{action.reason}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDismiss(action.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Snooze"
          >
            <AlarmClock className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDismiss(action.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDoIt(action.id)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <Zap className="h-3 w-3" />
            Do it
          </button>
        </div>
      </motion.div>
    );
  },
);