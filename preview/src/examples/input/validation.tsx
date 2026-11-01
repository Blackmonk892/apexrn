import { useState } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/apexrn';

export default function InputValidationExample() {
  const [email, setEmail] = useState('ada@example');
  const invalid = !email.includes('@') || !email.split('@')[1]?.includes('.');

  return (
    <View style={{ width: 300 }}>
      <Input
        label="Email"
        required
        value={email}
        onValueChange={setEmail}
        invalid={invalid}
        errorMessage="Enter a full email address"
        autoCapitalize="none"
      />
    </View>
  );
}
