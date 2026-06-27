import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import InputOTP from '@ui/components/input_otp';

export default function InputOTPScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [otp4, setOtp4] = useState('');
  const [otp6, setOtp6] = useState('');
  const [otpDisabled, setOtpDisabled] = useState('12');

  return (
    <Layout title="INPUT OTP COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>4-DIGIT CODE (DEFAULT)</Text>
        <InputOTP value={otp4} onChangeText={setOtp4} length={4} />
        <Text style={{ color: textColor, marginTop: 12 }}>Entered: {otp4}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>6-DIGIT CODE</Text>
        <InputOTP value={otp6} onChangeText={setOtp6} length={6} />
        <Text style={{ color: textColor, marginTop: 12 }}>Entered: {otp6}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED STATE</Text>
        <InputOTP value={otpDisabled} onChangeText={setOtpDisabled} length={4} disabled />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
