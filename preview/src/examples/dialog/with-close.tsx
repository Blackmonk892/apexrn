import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/apexrn';

export default function DialogWithCloseExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View changes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What's new in 2.4</DialogTitle>
          <DialogDescription>Faster sync, dark mode for charts and a few bug fixes.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
