import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/apexrn';

export default function DropdownMenuDestructiveExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">More</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem label="Edit profile" description="Name, photo and bio" onSelect={() => {}} />
        <DropdownMenuItem label="Sign out" onSelect={() => {}} />
        <DropdownMenuItem label="Delete account" destructive onSelect={() => {}} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
