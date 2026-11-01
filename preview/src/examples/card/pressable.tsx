import { Card, CardDescription, CardHeader, CardTitle } from '@/components/apexrn';

export default function CardPressableExample() {
  return (
    <Card style={{ width: 320 }} onPress={() => console.log('opened')} accessibilityLabel="Open order 1042">
      <CardHeader>
        <CardTitle>Order 1042</CardTitle>
        <CardDescription>Shipped Monday, arriving Thursday.</CardDescription>
      </CardHeader>
    </Card>
  );
}
