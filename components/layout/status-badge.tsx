import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 border-transparent font-medium',
        active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-success' : 'bg-muted-foreground/50')} />
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}

export function StudentStatusBadge({ active }: { active: boolean }) {
  return (
    <StatusBadge
      active={active}
      activeLabel="Active"
      inactiveLabel="Inactive"
    />
  );
}
