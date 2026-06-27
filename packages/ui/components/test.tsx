import React from 'react';
import { Text, View } from 'react-native';

export function TestComponent() {
  return (
    <View style={{ padding: 20, backgroundColor: '#FF5252', borderWidth: 3 }}>
      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Registry Architecture Works!</Text>
    </View>
  );
}