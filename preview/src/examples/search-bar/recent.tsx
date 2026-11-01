import { useState } from 'react';
import { View } from 'react-native';
import { SearchBar } from '@/components/apexrn';

export default function SearchBarRecentExample() {
  const [query, setQuery] = useState('');

  return (
    <View style={{ width: 320 }}>
      <SearchBar
        value={query}
        onValueChange={setQuery}
        placeholder="Search orders"
        recent={['Invoice 1042', 'Refunds', 'Shipping address']}
        onRecentPress={setQuery}
      />
    </View>
  );
}
