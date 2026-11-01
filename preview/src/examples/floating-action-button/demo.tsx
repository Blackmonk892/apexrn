import { View } from 'react-native';
import { FAB } from '@/components/apexrn';
import { PlusIcon } from '@/lib/apexrn/icons';
import { useTheme } from '@/lib/apexrn/theme';

export default function FABExample() {
  const { colors } = useTheme();

  return (
    <View style={{ width: 320, height: 120 }}>
      <FAB
        accessibilityLabel="New message"
        icon={<PlusIcon size={24} color={colors.primaryForeground} />}
        onPress={() => {}}
      />
    </View>
  );
}
