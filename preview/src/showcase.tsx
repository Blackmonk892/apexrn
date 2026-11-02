import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBar,
  AppBarAction,
  Avatar,
  Badge,
  BellIcon,
  BottomNav,
  BottomNavItem,
  Card,
  CardHeader,
  Checkbox,
  CheckIcon,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerItem,
  DrawerList,
  DrawerSection,
  DrawerTrigger,
  FAB,
  HomeIcon,
  ListItem,
  MenuIcon,
  PlusIcon,
  Progress,
  SegmentedControl,
  Separator,
  Switch,
  Text,
  UserIcon,
  spacing,
  useTheme,
} from '@apexrn/ui';
import { HighlightProvider, Part } from './part-highlight';
import { isDemoControlMessage, postToParent } from './protocol';

interface Run {
  id: string;
  day: string;
  title: string;
  detail: string;
  km: number;
}

// One week of a 12-week half-marathon block: 42 km over five runs, Sunday off.
const WEEK: Run[] = [
  { id: 'mon', day: 'Mon', title: 'Easy run', detail: 'Conversational pace', km: 6 },
  { id: 'tue', day: 'Tue', title: 'Intervals', detail: '6 × 800 m, 90 s jog', km: 7 },
  { id: 'wed', day: 'Wed', title: 'Easy run', detail: 'Flat loop, no watch', km: 5 },
  { id: 'thu', day: 'Thu', title: 'Tempo run', detail: '5:10 /km for 20 min', km: 8 },
  { id: 'sat', day: 'Sat', title: 'Long run', detail: 'Easy, last 3 km steady', km: 16 },
];
const PLANNED_KM = WEEK.reduce((sum, r) => sum + r.km, 0);
const INITIALLY_DONE = ['mon', 'tue', 'wed'];

const VIEWS = [
  { value: 'next', label: 'Up next' },
  { value: 'done', label: 'Done' },
];

type Tab = 'today' | 'plan' | 'me';

const STEP_MS = 2200;
const DRAWER_HOLD_MS = 2600;

type Schedule = (fn: () => void, ms: number) => void;

/** One scripted beat of the self-demo; `part` is the component slug the landing page labels. `ms` is how long the beat holds. */
interface DemoStep {
  part: string;
  ms?: number;
  run: (after: Schedule) => void;
}

/**
 * Plays `steps` on a loop while the parent says so. Idle until the first `running: true`, so screenshots
 * and docs embeds stay still, and every pending timer dies on stop so a hover hands over a quiet screen.
 * Effects run child-first, so this listener exists before App posts `apexrn:ready`.
 */
function useDemoLoop(steps: DemoStep[], onStop: () => void) {
  // Steps close over the latest render's setters; the listener is installed once.
  const latest = useRef({ steps, onStop });
  useEffect(() => {
    latest.current = { steps, onStop };
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    let running = false;
    let index = 0;

    const after: Schedule = (fn, ms) => {
      timers.push(setTimeout(fn, ms));
    };
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const tick = () => {
      const { steps: script } = latest.current;
      const step = script[index % script.length];
      index += 1;
      step.run(after);
      postToParent({ type: 'apexrn:demo-step', part: step.part });
      after(tick, step.ms ?? STEP_MS);
    };

    function onMessage(event: MessageEvent) {
      if (!isDemoControlMessage(event.data)) return;
      if (event.data.running && !running) {
        running = true;
        after(tick, STEP_MS);
      } else if (!event.data.running && running) {
        running = false;
        clear();
        latest.current.onStop();
      }
    }
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      clear();
    };
  }, []);
}

/** The landing page's phone: a training-plan screen built from parts, plus the outline the leader labels ask for. */
export function Showcase() {
  return (
    <HighlightProvider>
      <TrainingScreen />
    </HighlightProvider>
  );
}

function TrainingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('today');
  const [view, setView] = useState('next');
  const [done, setDone] = useState<string[]>(INITIALLY_DONE);
  const [remind, setRemind] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = (id: string, on: boolean) => setDone((d) => (on ? [...d.filter((x) => x !== id), id] : d.filter((x) => x !== id)));

  useDemoLoop(
    [
      { part: 'checkbox', run: () => toggle('thu', true) },
      { part: 'switch', run: () => setRemind((r) => !r) },
      { part: 'segmented-control', run: () => setView('done') },
      {
        part: 'drawer',
        ms: DRAWER_HOLD_MS + 900,
        run: (after) => {
          setView('next');
          setDrawerOpen(true);
          after(() => setDrawerOpen(false), DRAWER_HOLD_MS);
        },
      },
      { part: 'bottom-nav', run: () => setTab('plan') },
      {
        part: 'bottom-nav',
        run: () => {
          setTab('today');
          setDone(INITIALLY_DONE);
          setRemind(true);
        },
      },
    ],
    // A stop cancels the scheduled close, so close here or the drawer stays open under the user's cursor.
    () => setDrawerOpen(false),
  );

  const doneKm = WEEK.filter((r) => done.includes(r.id)).reduce((sum, r) => sum + r.km, 0);
  const left = WEEK.length - done.length;
  const title = tab === 'today' ? 'Today' : tab === 'plan' ? 'Plan' : 'Me';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Part slug="app-bar">
          <AppBar
            title={title}
            subtitle="Thu 6 Nov"
            topInset={insets.top}
            leading={
              <Part slug="drawer">
                <DrawerTrigger asChild>
                  <AppBarAction label="Open menu" icon={(c) => <MenuIcon size={22} color={c} />} />
                </DrawerTrigger>
              </Part>
            }
            trailing={<AppBarAction label="Notifications" icon={(c) => <BellIcon size={22} color={c} />} />}
          />
        </Part>
        {/* Sized from the screen it sits in, so it stays a panel with the scrim still showing beside it. */}
        <DrawerContent width={Math.round(width * 0.8)} topInset={insets.top} bottomInset={insets.bottom}>
          <DrawerHeader title="Maya Okafor" subtitle="Half marathon · 12 Apr">
            <View style={[styles.row, { marginTop: spacing.sm }]}>
              <Badge variant="accent" label="Week 6 of 12" />
            </View>
          </DrawerHeader>
          <DrawerList>
            <DrawerSection label="Training" />
            <DrawerItem number={1} label="Today" active={tab === 'today'} onPress={() => setTab('today')} />
            <DrawerItem number={2} label="Plan" active={tab === 'plan'} onPress={() => setTab('plan')} />
            <DrawerItem number={3} label="Run log" />
            <DrawerSection label="Gear" />
            <DrawerItem number={4} label="Shoes" />
            <DrawerItem number={5} label="Settings" />
          </DrawerList>
          <DrawerFooter>
            <Text variant="label" tone="muted">
              Synced 2 min ago
            </Text>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <View style={styles.grow}>
        {tab === 'today' ? (
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
            <View style={[styles.row, { gap: spacing.md }]}>
              <Avatar name="Maya Okafor" size="md" />
              <View style={styles.grow}>
                <Text variant="label" tone="muted">
                  Half marathon plan
                </Text>
                <Text variant="title">Week 6 of 12</Text>
              </View>
              <Badge variant="success" label="On track" />
            </View>

            <Part slug="progress">
              <Card>
                {/* Two-tone hero: the week's number on the accent fill, the bar on the plain surface below. */}
                <CardHeader style={{ backgroundColor: colors.accent }}>
                  <Text variant="label" style={{ color: colors.accentForeground }}>
                    This week
                  </Text>
                  <View style={styles.stat}>
                    <Text variant="display" style={[styles.big, { color: colors.accentForeground }]}>
                      {doneKm}
                    </Text>
                    <Text variant="title" style={{ color: colors.accentForeground, marginLeft: spacing.sm }}>
                      of {PLANNED_KM} km
                    </Text>
                  </View>
                </CardHeader>
                <Progress value={doneKm} max={PLANNED_KM} label={`${done.length} of ${WEEK.length} runs`} />
              </Card>
            </Part>

            <Part slug="segmented-control">
              <SegmentedControl segments={VIEWS} value={view} onValueChange={setView} accessibilityLabel="Show runs" />
            </Part>

            <View>
              <Separator />
              {WEEK.filter((r) => (view === 'done') === INITIALLY_DONE.includes(r.id))
                .slice(0, 2)
                .map((r, i) => (
                  <RunRow key={r.id} run={r} done={done.includes(r.id)} onToggle={toggle} slug={i === 0 ? 'checkbox' : undefined} />
                ))}
            </View>

            <Part slug="switch">
              <Switch checked={remind} onCheckedChange={setRemind} label="Remind me at 6:30" />
            </Part>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            <Text variant="label" tone="muted">
              Week 6 · 3 – 9 Nov
            </Text>
            <View>
              <Separator />
              {WEEK.map((r) => (
                <RunRow key={r.id} run={r} done={done.includes(r.id)} onToggle={toggle} />
              ))}
            </View>
          </ScrollView>
        )}
        <FAB
          accessibilityLabel="Log a run"
          label="Log run"
          icon={<PlusIcon size={22} color={colors.primaryForeground} />}
          onPress={() => toggle('sat', true)}
        />
      </View>

      <Part slug="bottom-nav">
        <BottomNav value={tab} onValueChange={(v) => setTab(v as Tab)} bottomInset={insets.bottom}>
          <BottomNavItem value="today" label="Today" icon={(c) => <HomeIcon size={22} color={c} />} />
          <BottomNavItem value="plan" label="Plan" badge={left || undefined} icon={(c) => <CheckIcon size={22} color={c} />} />
          <BottomNavItem value="me" label="Me" icon={(c) => <UserIcon size={22} color={c} />} />
        </BottomNav>
      </Part>
    </View>
  );
}

interface RunRowProps {
  run: Run;
  done: boolean;
  onToggle: (id: string, on: boolean) => void;
  /** Registers the checkbox for the landing page's outline. */
  slug?: string;
}

function RunRow({ run, done, onToggle, slug }: RunRowProps) {
  const box = <Checkbox checked={done} onCheckedChange={(on) => onToggle(run.id, on)} accessibilityLabel={`${run.title} done`} />;
  return (
    <View>
      <ListItem
        title={`${run.day} · ${run.title}`}
        description={run.detail}
        meta={`${run.km} km`}
        leading={slug ? <Part slug={slug}>{box}</Part> : box}
        onPress={() => onToggle(run.id, !done)}
      />
      <Separator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  stat: { flexDirection: 'row', alignItems: 'baseline' },
  // The one oversized number on the screen: the week's distance is what the runner opens the app for.
  big: { fontSize: 64, lineHeight: 64, letterSpacing: -2 },
});
