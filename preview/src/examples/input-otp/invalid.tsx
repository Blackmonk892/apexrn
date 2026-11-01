import { useState } from 'react';
import { View } from 'react-native';
import { InputOTP, Text } from '@/components/apexrn';

export default function InputOTPInvalidExample() {
  const [code, setCode] = useState('123456');

  return (
    <View style={{ width: 320, gap: 12 }}>
      <InputOTP length={6} value={code} onValueChange={setCode} invalid />
      <Text tone="muted">That code has expired. Request a new one.</Text>
    </View>
  );
}
