import { View } from 'react-native';
import { Button } from '@/components/apexrn';
import { PlusIcon, SearchIcon } from '@/lib/apexrn/icons';

export default function ButtonWithIconExample() {
  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      <Button icon={(color) => <PlusIcon size={20} color={color} />}>New project</Button>
      <Button
        variant="outline"
        icon={(color) => <SearchIcon size={20} color={color} />}
        iconPosition="right"
      >
        Search
      </Button>
    </View>
  );
}
