import { View } from 'react-native';
import { Button, Toaster, useToast } from '@/components/apexrn';

function Buttons() {
  const toast = useToast();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      <Button size="sm" variant="success" onPress={() => toast.success('Uploaded', 'report.pdf is ready.')}>
        Success
      </Button>
      <Button size="sm" variant="warning" onPress={() => toast.warning('Storage almost full')}>
        Warning
      </Button>
      <Button size="sm" variant="destructive" onPress={() => toast.error('Could not save')}>
        Error
      </Button>
    </View>
  );
}

export default function ToastVariantsExample() {
  return (
    <View style={{ width: 340, height: 220, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Toaster>
        <Buttons />
      </Toaster>
    </View>
  );
}
