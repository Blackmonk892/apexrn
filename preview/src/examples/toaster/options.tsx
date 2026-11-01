import { View } from 'react-native';
import { Button, Toaster, useToast } from '@/components/apexrn';

function ReminderButton() {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onPress={() => toast({ title: 'Reminder set', description: 'We will nudge you at 9:00.', variant: 'primary', duration: 5000 })}
    >
      Remind me
    </Button>
  );
}

export default function ToasterOptionsExample() {
  return (
    <View style={{ width: 340, height: 200, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Toaster>
        <ReminderButton />
      </Toaster>
    </View>
  );
}
