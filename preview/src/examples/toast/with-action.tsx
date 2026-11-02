import { View } from 'react-native';
import { Button, Toaster, useToast } from '@/components/apexrn';

function DeleteButton() {
  const toast = useToast();
  return (
    <Button
      variant="outline"
      onPress={() =>
        toast({
          title: 'Message deleted',
          duration: 6000,
          action: { label: 'Undo', onPress: () => console.log('restored') },
        })
      }
    >
      Delete message
    </Button>
  );
}

export default function ToastWithActionExample() {
  return (
    <View style={{ width: 340, height: 200, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Toaster>
        <DeleteButton />
      </Toaster>
    </View>
  );
}
