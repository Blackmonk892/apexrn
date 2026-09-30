import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppBar,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  ListItem,
  Progress,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useTheme,
} from '@apexrn/ui';
import Layout from '../components/Layout';

export default function ShowcaseScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [switchVal, setSwitchVal] = useState(true);
  const [checkVal, setCheckVal] = useState(true);
  const [progressVal, setProgressVal] = useState(0.72);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputText, setInputText] = useState('ApexRN Mobile System');

  return (
    <Layout title="SHOWCASE" onBack={onBack}>
      {/* Top Header Section */}
      <View style={styles.appHeader}>
        <AppBar title="APEXRN MOBILE" subtitle="Refined Brutalism v1.0" />
      </View>

      {/* Hero Card inside Mobile UI */}
      <Card style={styles.heroCard}>
        <View style={styles.cardRow}>
          <Avatar initials="AP" size="md" />
          <View style={styles.cardHeaderInfo}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Production Ready</Text>
            <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
              Copy-paste component architecture
            </Text>
          </View>
          <Badge label="STABLE" variant="accent" />
        </View>

        <Separator style={styles.sep} />

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Bundle</Text>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>0 Overhead</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Themes</Text>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>Light / Dark</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Typed</Text>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>100% TS</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.foreground }]}>System Status</Text>
            <Text style={[styles.progressText, { color: colors.foreground }]}>{Math.round(progressVal * 100)}%</Text>
          </View>
          <Progress value={progressVal} />
        </View>
      </Card>

      {/* Tabs Control */}
      <View style={styles.sectionMargin}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Tab Content 1: Overview */}
          <TabsContent value="overview">
            <View style={styles.tabSection}>
              <Input
                placeholder="Project Name"
                value={inputText}
                onChangeText={setInputText}
              />

              <View style={styles.chipsRow}>
                <Chip label="Expo 52+" selected onSelectedChange={() => {}} />
                <Chip label="RN 0.76+" defaultSelected />
                <Chip label="Zero Runtime" defaultSelected={false} />
              </View>

              <ListItem
                title="Brutalist Design Language"
                description="Hard 2px borders, intentional geometry"
                leading={<Badge label="01" variant="outline" />}
                trailing={<Switch checked={switchVal} onCheckedChange={setSwitchVal} />}
              />

              <ListItem
                title="TypeScript First Architecture"
                description="Full autocompletion and prop inference"
                leading={<Badge label="02" variant="outline" />}
                trailing={<Checkbox checked={checkVal} onCheckedChange={setCheckVal} />}
              />
            </View>
          </TabsContent>

          {/* Tab Content 2: Controls */}
          <TabsContent value="controls">
            <View style={styles.tabSection}>
              <Card>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Interactive Sliders & Progress</Text>
                <View style={{ gap: 12, marginTop: 12 }}>
                  <Button
                    title="Simulate Build Load"
                    variant="outline"
                    onPress={() => setProgressVal((p) => (p >= 1 ? 0.2 : p + 0.2))}
                  />
                  <Progress value={progressVal} />
                </View>
              </Card>
            </View>
          </TabsContent>

          {/* Tab Content 3: Actions */}
          <TabsContent value="actions">
            <View style={styles.tabSection}>
              <View style={styles.buttonStack}>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button title="OPEN DIALOG DEMO" variant="primary" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>APEXRN DIALOG</DialogTitle>
                      <DialogDescription>
                        This is a real React Native Dialog running live inside the embedded showcase iframe.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button title="CLOSE" variant="primary" size="sm" onPress={() => setDialogOpen(false)} />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button title="SECONDARY OUTLINE" variant="outline" />
                <Button title="DESTRUCTIVE ZONE" variant="destructive" />
              </View>
            </View>
          </TabsContent>
        </Tabs>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    marginBottom: 16,
  },
  heroCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  sep: {
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionMargin: {
    marginBottom: 16,
  },
  tabSection: {
    gap: 12,
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  buttonStack: {
    gap: 12,
  },
});
