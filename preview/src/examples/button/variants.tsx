import { View } from 'react-native';
import { Button } from '@/components/apexrn';

export default function ButtonVariantsExample() {
  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Share</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="destructive">Delete account</Button>
      <Button variant="success">Publish</Button>
      <Button variant="warning">Review</Button>
    </View>
  );
}
