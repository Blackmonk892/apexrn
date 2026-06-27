import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Alert from '@ui/components/alert';

export default function AlertScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const InfoIcon = () => <Text style={{ fontSize: 16 }}>ℹ️</Text>;
  const WarnIcon = () => <Text style={{ fontSize: 16 }}>⚠️</Text>;
  const ErrorIcon = () => <Text style={{ fontSize: 16 }}>🚨</Text>;
  const SuccessIcon = () => <Text style={{ fontSize: 16 }}>✅</Text>;

  return (
    <Layout title="ALERT COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT VARIANT</Text>
        <Alert 
          title="Update Available" 
          description="A new version of the app is ready to download."
          icon={<InfoIcon />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WARNING VARIANT</Text>
        <Alert 
          variant="warning"
          title="Network Unstable" 
          description="You are currently on a poor connection. Some features may not work."
          icon={<WarnIcon />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DESTRUCTIVE VARIANT</Text>
        <Alert 
          variant="destructive"
          title="Payment Failed" 
          description="Your credit card was declined. Please update your billing information."
          icon={<ErrorIcon />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>SUCCESS VARIANT</Text>
        <Alert 
          variant="success"
          title="Profile Saved" 
          description="Your changes have been successfully saved."
          icon={<SuccessIcon />}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});