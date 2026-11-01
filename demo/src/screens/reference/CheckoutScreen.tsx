import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppBar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  NumberInput,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Text,
  spacing,
} from '@apexrn/ui';
import Layout from '../../components/Layout';

const SHIPPING = [
  { value: 'standard', label: 'Standard, 4 to 6 days', price: 4.5 },
  { value: 'express', label: 'Express, 1 to 2 days', price: 12 },
  { value: 'pickup', label: 'Pick up in store', price: 0 },
];
const UNIT_PRICE = 38;

const money = (n: number) => `$${n.toFixed(2)}`;
const validEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

export default function CheckoutScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('maya@example.com');
  const [address, setAddress] = useState('');
  const [shipping, setShipping] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);

  const nameError = submitted && !name.trim() ? 'Enter the name on the order.' : undefined;
  const emailError = submitted && !validEmail(email) ? 'Enter a valid email address.' : undefined;
  const addressError = submitted && !address.trim() ? 'Enter a delivery address.' : undefined;

  const shippingPrice = SHIPPING.find((s) => s.value === shipping)?.price ?? 0;
  const subtotal = UNIT_PRICE * quantity;
  const total = subtotal + shippingPrice;

  const placeOrder = () => {
    setSubmitted(true);
    if (!name.trim() || !validEmail(email) || !address.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPlaced(true);
    }, 1200);
  };

  return (
    <Layout id="ref-checkout" title="CHECKOUT" onBack={onBack}>
      <View style={styles.page}>
        <AppBar title="Checkout" onBack={onBack} backLabel="Back to cart" />

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>We send the receipt here.</CardDescription>
          </CardHeader>
          <CardContent style={styles.stack}>
            <Input label="Full name" required value={name} onValueChange={setName} errorMessage={nameError} invalid={!!nameError} autoComplete="name" testID="ref-name" />
            <Input
              label="Email"
              required
              value={email}
              onValueChange={setEmail}
              errorMessage={emailError}
              invalid={!!emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="ref-email"
            />
            <Input
              label="Delivery address"
              required
              value={address}
              onValueChange={setAddress}
              errorMessage={addressError}
              invalid={!!addressError}
              autoComplete="street-address"
              testID="ref-address"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={shipping} onValueChange={setShipping} accessibilityLabel="Shipping method">
              {SHIPPING.map((s) => (
                <RadioGroupItem key={s.value} value={s.value} label={s.label} testID={`ref-ship-${s.value}`} />
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order</CardTitle>
            <CardDescription>Canvas tote, natural</CardDescription>
          </CardHeader>
          <CardContent style={styles.stack}>
            <NumberInput label="Quantity" value={quantity} onValueChange={setQuantity} min={1} max={10} testID="ref-quantity" />
            <Separator />
            <Row label="Subtotal" value={money(subtotal)} />
            <Row label="Shipping" value={shippingPrice ? money(shippingPrice) : 'Free'} />
            <Separator />
            <Row label="Total" value={money(total)} strong />
          </CardContent>
        </Card>

        <Button size="lg" variant="primary" loading={loading} onPress={placeOrder} style={styles.cta} testID="ref-place-order">
          {`Place order, ${money(total)}`}
        </Button>
        {placed ? (
          <Text variant="mono" tone="muted" testID="ref-checkout-log">
            Order placed
          </Text>
        ) : null}
      </View>
    </Layout>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Label>{label}</Label>
      <Text variant={strong ? 'strong' : 'mono'}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
  stack: { gap: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cta: { alignSelf: 'stretch' },
});
