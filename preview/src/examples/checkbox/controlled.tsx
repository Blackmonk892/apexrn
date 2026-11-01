import { useState } from 'react';
import { View } from 'react-native';
import { Button, Checkbox } from '@/components/apexrn';

export default function CheckboxControlledExample() {
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={{ gap: 16 }}>
      <Checkbox label="I accept the terms" checked={agreed} onCheckedChange={setAgreed} />
      <Button disabled={!agreed}>Create account</Button>
    </View>
  );
}
