import { Button, EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateTitle } from '@/components/apexrn';

export default function EmptyStateStartAlignedExample() {
  return (
    <EmptyState align="start">
      <EmptyStateTitle>No results for "invoice"</EmptyStateTitle>
      <EmptyStateDescription>Try a different word or clear the filters.</EmptyStateDescription>
      <EmptyStateActions>
        <Button variant="outline" onPress={() => {}}>
          Clear filters
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
