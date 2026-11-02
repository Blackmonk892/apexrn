import { useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from '@/components/apexrn';

export default function DialogControlledExample() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  function save() {
    console.log('renamed to', name);
    setOpen(false);
  }

  return (
    <View>
      <Button onPress={() => setOpen(true)}>Rename project</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Pick a name your team will recognise.</DialogDescription>
          </DialogHeader>
          <Input value={name} onChangeText={setName} placeholder="Project name" />
          <DialogFooter>
            <Button variant="outline" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onPress={save} disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
