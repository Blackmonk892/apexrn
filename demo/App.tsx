import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Importing components directly from your UI packages folder via path aliases
import Button from '@ui/components/button';
import Card, { CardHeader, CardFooter } from '@ui/components/card';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <Text style={styles.title}>APEXRN</Text>
        <Text style={styles.subtitle}>BRUTALISM SHOWCASE</Text>

        {/* ---- BUTTON SECTION ---- */}
        <Text style={styles.sectionLabel}>BUTTON</Text>

        <Text style={styles.groupLabel}>Variants</Text>
        <View style={styles.row}>
          <Button title="Default" onPress={() => {}} />
          <Button title="Primary" variant="primary" onPress={() => {}} />
          <Button title="Outline" variant="outline" onPress={() => {}} />
        </View>

        <Text style={styles.groupLabel}>Sizes</Text>
        <View style={styles.row}>
          <Button title="Small" size="sm" variant="primary" onPress={() => {}} />
          <Button title="Medium" size="md" variant="primary" onPress={() => {}} />
          <Button title="Large" size="lg" variant="primary" onPress={() => {}} />
        </View>

        <Text style={styles.groupLabel}>States</Text>
        <View style={styles.row}>
          <Button title="Disabled" disabled onPress={() => {}} />
          <Button title="Loading" loading variant="primary" onPress={() => {}} />
        </View>

        {/* ---- CARD SECTION ---- */}
        <Text style={styles.sectionLabel}>CARD</Text>

        <Text style={styles.groupLabel}>Default Card</Text>
        <Card>
          <Text style={styles.cardTitle}>CARD TITLE</Text>
          <Text style={styles.cardBody}>
            This is a default card with thick borders and a hard shadow.
          </Text>
        </Card>

        <Text style={styles.groupLabel}>Primary Card</Text>
        <Card variant="primary">
          <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>
            PRIMARY CARD
          </Text>
          <Text style={[styles.cardBody, { color: '#FFFFFF' }]}>
            Bold red background with white text.
          </Text>
        </Card>

        <Text style={styles.groupLabel}>Accent Card</Text>
        <Card variant="accent">
          <Text style={styles.cardTitle}>ACCENT CARD</Text>
          <Text style={styles.cardBody}>
            Bright yellow — perfect for callouts and highlights.
          </Text>
        </Card>

        <Text style={styles.groupLabel}>Pressable Card</Text>
        <Card onPress={() => console.log('Card pressed!')}>
          <Text style={styles.cardTitle}>TAP ME</Text>
          <Text style={styles.cardBody}>
            This card has the physical press animation. Try it.
          </Text>
        </Card>

        <Text style={styles.groupLabel}>Card Composed with Button</Text>
        <Card>
          <CardHeader>
            <Text style={styles.cardTitle}>PRICING PLAN</Text>
          </CardHeader>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#000' }}>
              $9/mo
            </Text>
            <Text style={{ marginTop: 8, color: '#757575' }}>
              Everything you need. No limits.
            </Text>
          </View>
          <CardFooter>
            <Button title="Get Started" variant="primary" onPress={() => {}} />
          </CardFooter>
        </Card>

        {/* Bottom spacing for aesthetics */}
        <View style={{ height: 64 }} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 72,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginTop: 40,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    fontSize: 15,
    color: '#000000',
    marginTop: 8,
    lineHeight: 22,
  },
});