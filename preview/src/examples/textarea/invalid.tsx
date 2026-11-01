import { useState } from 'react';
import { View } from 'react-native';
import { Textarea } from '@/components/apexrn';

export default function TextareaInvalidExample() {
  const [note, setNote] = useState('Too short');

  return (
    <View style={{ width: 300 }}>
      <Textarea
        label="Feedback"
        required
        value={note}
        onValueChange={setNote}
        invalid={note.length < 20}
        errorMessage="Write at least 20 characters"
        minRows={3}
      />
    </View>
  );
}
