import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Button from '@ui/components/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/components/dialog';
import { Sheet, SheetContent } from '@ui/components/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@ui/components/dropdown_menu';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@ui/components/select';
import { DatePicker, DatePickerTrigger, DatePickerContent } from '@ui/components/datepicker';

export default function OverlayScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [date, setDate] = useState<Date | null>(null);

  return (
    <Layout title="OVERLAYS & MENUS" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>DIALOG</Text>
      <Dialog>
        <DialogTrigger asChild>
          <Button title="Open Dialog" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ARE YOU SURE?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button title="Cancel" variant="outline" />
            <Button title="Continue" variant="primary" />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Text style={[styles.label, { color: textColor }]}>SHEET</Text>
      <Button title="Open Sheet" onPress={() => setSheetOpen(true)} />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        {() => (
          <SheetContent sheetHeight={300}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>BOTTOM SHEET</Text>
            <Text style={{ marginTop: 16, color: textColor }}>You can swipe me down to close.</Text>
          </SheetContent>
        )}
      </Sheet>

      <Text style={[styles.label, { color: textColor }]}>DROPDOWN MENU</Text>
      <View style={{ zIndex: 10 }}>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button title="Options..." />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem label="Profile" />
            <DropdownMenuItem label="Settings" />
            <DropdownMenuItem label="Logout" />
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      <Text style={[styles.label, { color: textColor }]}>SELECT (Value: {selectValue})</Text>
      <View style={{ zIndex: 5 }}>
        <Select value={selectValue} onValueChange={setSelectValue}>
          <SelectTrigger placeholder="Choose a framework" />
          <SelectContent>
            <SelectItem label="React Native" value="rn" />
            <SelectItem label="Flutter" value="flutter" />
            <SelectItem label="Swift" value="swift" />
          </SelectContent>
        </Select>
      </View>

      <Text style={[styles.label, { color: textColor }]}>DATE PICKER</Text>
      <DatePicker value={date} onChange={setDate}>
        <DatePickerTrigger placeholder="Select a date" />
        <DatePickerContent />
      </DatePicker>
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: 1 },
});
