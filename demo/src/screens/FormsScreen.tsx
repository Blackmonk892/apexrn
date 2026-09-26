import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Input from '@ui/components/input';
import Checkbox from '@ui/components/checkbox';
import { RadioGroup, RadioGroupItem } from '@ui/components/radiogroup';
import Switch from '@ui/components/switch';
import Slider from '@ui/components/slider';

export default function FormsScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('1');
  const [switchOn, setSwitchOn] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);

  return (
    <Layout title="FORMS & INPUTS" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>INPUT FIELD</Text>
      <Input placeholder="Enter your text here..." />
      <View style={{ height: 16 }} />
      <Input placeholder="Disabled input" disabled />

      <Text style={[styles.label, { color: textColor }]}>CHECKBOX</Text>
      <View style={styles.row}>
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <Text style={[styles.rowText, { color: textColor }]}>Accept terms</Text>
      </View>

      <Text style={[styles.label, { color: textColor }]}>RADIO GROUP</Text>
      <RadioGroup value={radioValue} onValueChange={setRadioValue}>
        <View style={styles.row}>
          <RadioGroupItem value="1" />
          <Text style={[styles.rowText, { color: textColor }]}>Option 1</Text>
        </View>
        <View style={styles.row}>
          <RadioGroupItem value="2" />
          <Text style={[styles.rowText, { color: textColor }]}>Option 2</Text>
        </View>
      </RadioGroup>

      <Text style={[styles.label, { color: textColor }]}>SWITCH</Text>
      <View style={styles.row}>
        <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
        <Text style={[styles.rowText, { color: textColor }]}>Notifications</Text>
      </View>

      <Text style={[styles.label, { color: textColor }]}>SLIDER (Value: {sliderVal})</Text>
      <Slider value={sliderVal} onValueChange={setSliderVal} min={0} max={100} step={1} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  rowText: { fontSize: 14, fontWeight: '600' }
});
