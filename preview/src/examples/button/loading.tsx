import { useState } from 'react';
import { Button } from '@/components/apexrn';

export default function ButtonLoadingExample() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  }

  return (
    <Button loading={saving} onPress={save}>
      Save changes
    </Button>
  );
}
