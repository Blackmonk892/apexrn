import { View } from 'react-native';
import { InputOTP } from '@/components/apexrn';

export default function InputOTPExample() {
  return (
    <View style={{ width: 320 }}>
      <InputOTP length={6} onComplete={(code) => console.log('verify', code)} />
    </View>
  );
}
