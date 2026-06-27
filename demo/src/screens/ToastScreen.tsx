import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Toast from '@ui/components/toast';
import Button from '@ui/components/button';

export default function ToastScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [toast1Visible, setToast1Visible] = useState(false);
  const [toast2Visible, setToast2Visible] = useState(false);
  const [toast3Visible, setToast3Visible] = useState(false);

  return (
    <Layout title="TOAST COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT TOAST</Text>
        <Button 
          title="Show Default Toast" 
          onPress={() => setToast1Visible(true)} 
        />
        <Toast 
          visible={toast1Visible}
          onDismiss={() => setToast1Visible(false)}
          title="Action Completed"
          description="Your file has been uploaded."
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>PRIMARY TOAST</Text>
        <Button 
          title="Show Primary Toast" 
          onPress={() => setToast2Visible(true)} 
        />
        <Toast 
          visible={toast2Visible}
          onDismiss={() => setToast2Visible(false)}
          variant="primary"
          title="Achievement Unlocked!"
          description="You completed your first task."
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DESTRUCTIVE TOAST</Text>
        <Button 
          title="Show Destructive Toast" 
          onPress={() => setToast3Visible(true)} 
        />
        <Toast 
          visible={toast3Visible}
          onDismiss={() => setToast3Visible(false)}
          variant="destructive"
          title="Error Occurred"
          description="Could not save changes."
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36, zIndex: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
