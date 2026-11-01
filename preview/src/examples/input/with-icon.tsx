import { View } from 'react-native';
import { Input } from '@/components/apexrn';
import { SearchIcon } from '@/lib/apexrn/icons';
import { useTheme } from '@/lib/apexrn/theme';

export default function InputWithIconExample() {
  const { colors } = useTheme();

  return (
    <View style={{ width: 300 }}>
      <Input placeholder="Search orders" leading={<SearchIcon size={20} color={colors.mutedForeground} />} />
    </View>
  );
}
