import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/apexrn';

export default function DropdownMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem label="Rename" onSelect={() => console.log('rename')} />
        <DropdownMenuItem label="Duplicate" onSelect={() => console.log('duplicate')} />
        <DropdownMenuItem label="Archive" onSelect={() => console.log('archive')} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
