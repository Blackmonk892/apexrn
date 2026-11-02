import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/apexrn';

export default function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Share project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this project?</DialogTitle>
          <DialogDescription>Anyone with the link will be able to view it.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="primary">Copy link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
