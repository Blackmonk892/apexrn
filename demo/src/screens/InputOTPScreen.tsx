import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, InputOTP, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const CORRECT = '123456';

export default function InputOTPScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [otp4, setOtp4] = useState('');
  const [otp6, setOtp6] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const wrong = submitted && otp6 !== CORRECT;

  return (
    <Layout title="INPUT OTP" onBack={onBack}>
      <Section title="Four digits" note="Tap the blocks to focus. The active block shows a cursor and its shadow.">
        <InputOTP value={otp4} onChangeText={setOtp4} length={4} />
        <Caption>{`Value: ${otp4 || 'empty'}`}</Caption>
      </Section>

      <Section title="Six digits, with validation" note={`The correct code is ${CORRECT}. A wrong code turns every block destructive with a permanent shadow.`}>
        <InputOTP
          value={otp6}
          onChangeText={(t) => {
            setOtp6(t);
            setSubmitted(false);
          }}
          length={6}
          error={wrong}
        />
        <View style={styles.row}>
          <Button title="Verify" variant="primary" size="sm" disabled={otp6.length < 6} onPress={() => setSubmitted(true)} />
          <Button title="Clear" variant="outline" size="sm" onPress={() => { setOtp6(''); setSubmitted(false); }} />
        </View>
        {wrong ? (
          <Text style={[styles.error, { color: colors.destructive }]}>That code is not right. Check the digits and try again.</Text>
        ) : submitted ? (
          <Caption>Code accepted.</Caption>
        ) : null}
      </Section>

      <Section title="Uncontrolled" note="defaultValue keeps its own state.">
        <InputOTP defaultValue="42" length={4} />
      </Section>

      <Section title="Disabled">
        <InputOTP value="12" length={4} disabled />
        <Caption>Muted blocks, no shadow, no focus.</Caption>
      </Section>

      <Section title="Edge cases" note="Blocks shrink to fit: eight digits in a 320pt container.">
        <View style={styles.narrow}>
          <InputOTP defaultValue="1234" length={8} />
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, justifyContent: 'center', paddingTop: 4 },
  error: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  narrow: { width: 320 },
});
