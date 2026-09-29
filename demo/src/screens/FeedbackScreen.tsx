import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { Badge, Progress, Skeleton, Alert, Toast, Button, useTheme } from '@apexrn/ui';

export default function FeedbackScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const textColor = colors.foreground;
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <Layout title="FEEDBACK" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>BADGES</Text>
      <View style={styles.row}>
        <Badge label="Default" />
        <Badge label="Primary" variant="primary" />
        <Badge label="Outline" variant="outline" />
        <Badge label="Accent" variant="accent" withShadow />
      </View>

      <Text style={[styles.label, { color: textColor }]}>PROGRESS</Text>
      <Progress value={60} withShadow />
      <View style={{ height: 16 }} />
      <Progress value={30} />

      <Text style={[styles.label, { color: textColor }]}>SKELETON</Text>
      <Skeleton style={{ height: 40 }} />
      <View style={{ height: 8 }} />
      <Skeleton style={{ height: 20, width: '70%' }} />

      <Text style={[styles.label, { color: textColor }]}>ALERT</Text>
      <Alert title="UPDATE AVAILABLE" description="Please update your app to continue." />
      <View style={{ height: 16 }} />
      <Alert variant="destructive" title="ERROR OCCURRED" description="Failed to save data." />

      <Text style={[styles.label, { color: textColor }]}>TOAST</Text>
      <Button title="Show Toast" onPress={() => setToastVisible(true)} />

      <Toast 
        visible={toastVisible} 
        title="SUCCESS!" 
        description="Your changes have been saved."
        onDismiss={() => setToastVisible(false)} 
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
});
