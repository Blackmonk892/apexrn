import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@ui/components/dropdown_menu';
import Button from '@ui/components/button';
import Avatar from '@ui/components/avatar';

export default function DropdownScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <Layout title="DROPDOWN MENU COMPONENT" onBack={onBack}>
      <View style={[styles.section, { zIndex: 10 }]}>
        <Text style={[styles.label, { color: textColor }]}>BUTTON TRIGGER</Text>
        <DropdownMenu open={open1} onOpenChange={setOpen1}>
          <DropdownMenuTrigger asChild>
            <Button title="Actions ▾" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem label="Edit Profile" />
            <DropdownMenuItem label="Account Settings" />
            <DropdownMenuItem label="Log Out" />
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      <View style={[styles.section, { zIndex: 5 }]}>
        <Text style={[styles.label, { color: textColor }]}>CUSTOM TRIGGER (AVATAR)</Text>
        <DropdownMenu open={open2} onOpenChange={setOpen2}>
          <DropdownMenuTrigger asChild>
            <View style={{ alignSelf: 'flex-start' }}>
              <Avatar initials="JD" size="lg" withShadow />
            </View>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem label="View Profile" />
            <DropdownMenuItem label="Status" />
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
