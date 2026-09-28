import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/components/dialog';
import Button from '@ui/components/button';

export default function DialogScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <Layout title="DIALOG COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT DIALOG</Text>
        <Dialog>
          <DialogTrigger asChild>
            <Button title="Open Simple Dialog" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hello World</DialogTitle>
              <DialogDescription>This is a basic dialog without actions.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH ACTIONS (FOOTER)</Text>
        <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
          <DialogTrigger asChild>
            <Button title="Open Action Dialog" variant="outline" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>CONFIRM DELETION</DialogTitle>
              <DialogDescription>Are you sure you want to delete this file? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button title="CANCEL" variant="outline" onPress={() => setActionsOpen(false)} />
              <Button title="DELETE" variant="primary" onPress={() => setActionsOpen(false)} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>CUSTOM CONTENT</Text>
        <Dialog>
          <DialogTrigger asChild>
            <Button title="Open Custom Dialog" variant="outline" />
          </DialogTrigger>
          <DialogContent>
            <View style={{ padding: 20, backgroundColor: '#000', borderWidth: 2, borderColor: '#FFF' }}>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>CUSTOM BRUTALIST BLOCK</Text>
              <Text style={{ color: '#AAA', marginTop: 8 }}>You can place anything inside the dialog content.</Text>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36, zIndex: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
