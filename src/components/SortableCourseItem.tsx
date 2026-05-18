import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Course } from '@/contexts/ContentContext';
import { ReactNode } from 'react';

interface SortableCourseItemProps {
  course: Course;
  index: number;
  children: ReactNode;
}

export const SortableCourseItem = ({ course, index, children }: SortableCourseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={`course-${index}`} className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <Badge variant="outline">#{index + 1}</Badge>
            <span className="font-medium text-left flex-1">{course.title}</span>
            <Badge variant="secondary">{course.school}</Badge>
            {course.promoCode && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {course.promoCode.code}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
