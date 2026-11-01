import { useState } from 'react';
import { View } from 'react-native';
import { SearchBar } from '@/components/apexrn';

export default function SearchBarExample() {
  const [query, setQuery] = useState('');

  return (
    <View style={{ width: 320 }}>
      <SearchBar
        value={query}
        onValueChange={setQuery}
        placeholder="Search messages"
        onSubmit={(value) => console.log('search', value)}
        onCancel={() => setQuery('')}
      />
    </View>
  );
}
