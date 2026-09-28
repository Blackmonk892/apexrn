import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { Sheet, SheetContent } from '@ui/components/sheet';
import Button from '@ui/components/button';
import Input from '@ui/components/input';

export default function SheetScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [sheet1Open, setSheet1Open] = useState(false);
  const [sheet2Open, setSheet2Open] = useState(false);

  return (
    <Layout title="SHEET COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT BOTTOM SHEET</Text>
        <Button title="Open Standard Sheet" onPress={() => setSheet1Open(true)} />
        
        <Sheet open={sheet1Open} onOpenChange={setSheet1Open}>
          {({ handleDismiss }) => (
            <SheetContent sheetHeight={300}>
              <View style={styles.sheetBody}>
                <Text style={[styles.sheetTitle, { color: textColor }]}>MENU</Text>
                <Text style={[styles.sheetText, { color: textColor }]}>Swipe down or press the button to close.</Text>
                <Button title="Close Sheet" onPress={handleDismiss} style={{ marginTop: 24 }} />
              </View>
            </SheetContent>
          )}
        </Sheet>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>TALL SHEET WITH INPUTS</Text>
        <Button title="Open Tall Sheet" variant="outline" onPress={() => setSheet2Open(true)} />
        
        <Sheet open={sheet2Open} onOpenChange={setSheet2Open}>
          {({ handleDismiss }) => (
            <SheetContent sheetHeight={500}>
              <View style={styles.sheetBody}>
                <Text style={[styles.sheetTitle, { color: textColor }]}>EDIT PROFILE</Text>
                <View style={{ gap: 16, marginTop: 24 }}>
                  <Input placeholder="Username" />
                  <Input placeholder="Email Address" />
                  <Input placeholder="Bio" style={{ height: 100 }} multiline />
                </View>
                <Button title="Save Changes" variant="primary" onPress={handleDismiss} style={{ marginTop: 24 }} />
              </View>
            </SheetContent>
          )}
        </Sheet>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36, zIndex: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  sheetBody: { flex: 1, padding: 16 },
  sheetTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  sheetText: { fontSize: 16 }
});
