import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/apexrn';

export default function ChipRemovableExample() {
  const [tags, setTags] = useState(['Design', 'Code', 'Research']);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: 300 }}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} onRemove={() => setTags((list) => list.filter((t) => t !== tag))} />
      ))}
    </View>
  );
}
