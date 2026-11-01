import { Button, EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@/components/apexrn';
import { InfoIcon } from '@/lib/apexrn/icons';

export default function EmptyStateExample() {
  return (
    <EmptyState>
      <EmptyStateIcon>{(color) => <InfoIcon size={28} color={color} />}</EmptyStateIcon>
      <EmptyStateTitle>No messages yet</EmptyStateTitle>
      <EmptyStateDescription>New mail shows up here.</EmptyStateDescription>
      <EmptyStateActions>
        <Button onPress={() => {}}>Compose</Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
