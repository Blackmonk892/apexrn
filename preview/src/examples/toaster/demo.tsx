import { View } from 'react-native';
import { Button, Toaster, useToast } from '@/components/apexrn';

function SendButton() {
  const toast = useToast();
  return (
    <Button
      onPress={() => {
        toast('Sending');
        toast.success('Sent', 'Your message is on its way.');
      }}
    >
      Send message
    </Button>
  );
}

export default function ToasterExample() {
  return (
    <View style={{ width: 340, height: 260, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Toaster>
        <SendButton />
      </Toaster>
    </View>
  );
}
