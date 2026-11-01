import { View } from 'react-native';
import { Button, Toaster, useToast } from '@/components/apexrn';

function SaveButton() {
  const toast = useToast();
  return <Button onPress={() => toast('Changes saved')}>Save changes</Button>;
}

export default function ToastExample() {
  return (
    <View style={{ width: 340, height: 200, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Toaster>
        <SaveButton />
      </Toaster>
    </View>
  );
}
