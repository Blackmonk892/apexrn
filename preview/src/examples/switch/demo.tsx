import { useState } from 'react';
import { Switch } from '@/components/apexrn';

export default function SwitchExample() {
  const [enabled, setEnabled] = useState(true);

  return <Switch label="Push notifications" checked={enabled} onCheckedChange={setEnabled} />;
}
