import { AlertDialog, Button } from '@/components/apexrn';

export default function DeleteAccountExample() {
  return (
    <AlertDialog
      title="Delete account?"
      description="Your projects and settings will be removed for good."
      actionText="Delete"
      onAction={() => console.log('deleted')}
    >
      <Button variant="destructive">Delete account</Button>
    </AlertDialog>
  );
}
