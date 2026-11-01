import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Progress } from '@/components/apexrn';

export default function ProgressLiveExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={{ width: 300 }}>
      <Progress label="Exporting" value={value} />
    </View>
  );
}
