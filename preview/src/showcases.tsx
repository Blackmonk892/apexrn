import React, { useEffect, useState, type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AppBar,
  AppBarAction,
  BellIcon,
  BottomNav,
  BottomNavItem,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerItem,
  DrawerList,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  FAB,
  HomeIcon,
  InfoIcon,
  Label,
  Marquee,
  PlusIcon,
  RadioGroup,
  RadioGroupItem,
  SearchIcon,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  Toast,
  Toaster,
  UserIcon,
  useTheme,
  useToast,
} from '@apexrn/ui';

/**
 * Per-part compositions for parts whose plain-props render is incomplete (they
 * need children or data). The docs page sends the same `{ component, props }`
 * message for every part; the control props arrive here and are spread onto the
 * sub-part they belong to. Overlays render a trigger and start open: the docs
 * controls send `open`/`defaultOpen` as false toggles, which are ignored here.
 */
type Props = Record<string, any>;

const noop = () => {};
const OPEN = { defaultOpen: true } as const;
/** Auto-dismiss pushed out so a toast stays on screen for the preview. */
const HOLD = 3_600_000;

function Stage({ children }: { children: React.ReactNode }) {
  return <View style={styles.stage}>{children}</View>;
}

function AccordionShowcase({ type = 'single' }: Props) {
  return (
    <Accordion type={type} defaultValue={type === 'multiple' ? ['a'] : 'a'}>
      <AccordionItem value="a">
        <AccordionTrigger>What is ApexRN?</AccordionTrigger>
        <AccordionContent>
          <Text>Brutalist components you own, copied into your app.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Does it need a runtime?</AccordionTrigger>
        <AccordionContent>
          <Text>Only react-native peers. No extra dependencies.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Can I restyle it?</AccordionTrigger>
        <AccordionContent>
          <Text>Swap tokens, or edit the file. It is yours.</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AlertShowcase({ variant }: Props) {
  return (
    <Stage>
      <Alert variant={variant} title="Storage almost full" description="92% of 5 GB used. Free some space to keep syncing." />
    </Stage>
  );
}

function AlertDialogShowcase({ destructive = true }: Props) {
  return (
    <AlertDialog {...OPEN} destructive={destructive}>
      <AlertDialogTrigger asChild>
        <Button variant={destructive ? 'destructive' : 'primary'}>Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>All projects and keys are removed. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AppBarShowcase({ variant, size }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <AppBar
      title="Inbox"
      subtitle="12 unread"
      variant={variant}
      size={size}
      topInset={insets.top}
      onBack={noop}
      trailing={<AppBarAction label="Search" icon={(c: string) => <SearchIcon size={20} color={c} />} onPress={noop} />}
    />
  );
}

function BottomNavShowcase({ labelMode }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('home');
  return (
    <View style={styles.bottom}>
      <BottomNav value={tab} onValueChange={setTab} bottomInset={insets.bottom} labelMode={labelMode}>
        <BottomNavItem value="home" label="Home" icon={(c: string) => <HomeIcon size={22} color={c} />} />
        <BottomNavItem value="alerts" label="Alerts" badge={3} icon={(c: string) => <BellIcon size={22} color={c} />} />
        <BottomNavItem value="me" label="Me" icon={(c: string) => <UserIcon size={22} color={c} />} />
      </BottomNav>
    </View>
  );
}

function CardShowcase({ variant, disabled }: Props) {
  return (
    <Stage>
      <Card variant={variant} disabled={disabled}>
        <CardHeader>
          <CardTitle>Pro plan</CardTitle>
          <CardDescription>For teams shipping weekly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text variant="title">$9 / month</Text>
          <Text tone="muted">Unlimited projects.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="primary">Upgrade</Button>
        </CardFooter>
      </Card>
    </Stage>
  );
}

const SLIDES = [
  { id: 'a', title: 'Own the code', body: 'Copy a component, edit it, ship it.' },
  { id: 'b', title: 'Hard shadows', body: 'Thick borders and zero radius.' },
  { id: 'c', title: 'Real physics', body: 'Spring presses with haptics.' },
];

function CarouselShowcase({ showIndicators = true, showControls = true }: Props) {
  const { colors } = useTheme();
  return (
    <Stage>
      <Carousel
        data={SLIDES}
        keyExtractor={(s) => s.id}
        showIndicators={showIndicators}
        showControls={showControls}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="title">{item.title}</Text>
            <Text tone="muted">{item.body}</Text>
          </View>
        )}
      />
    </Stage>
  );
}

function DatePickerShowcase() {
  return (
    <Stage>
      <DatePicker {...OPEN}>
        <DatePickerTrigger placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>
    </Stage>
  );
}

function DialogShowcase() {
  return (
    <Dialog {...OPEN}>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This will apply immediately.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="primary">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DrawerShowcase() {
  const insets = useSafeAreaInsets();
  return (
    <Drawer {...OPEN}>
      <DrawerTrigger asChild>
        <Button>Menu</Button>
      </DrawerTrigger>
      <DrawerContent topInset={insets.top} bottomInset={insets.bottom}>
        <DrawerHeader title="ApexRN" subtitle="Signed in" />
        <DrawerList>
          <DrawerItem label="Home" active onPress={noop} />
          <DrawerItem label="Inbox" badge={12} onPress={noop} />
          <DrawerItem label="Settings" onPress={noop} />
        </DrawerList>
      </DrawerContent>
    </Drawer>
  );
}

function DropdownMenuShowcase() {
  return (
    <Stage>
      <DropdownMenu {...OPEN}>
        <DropdownMenuTrigger asChild>
          <Button>Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem label="Edit" onSelect={noop} />
          <DropdownMenuItem label="Duplicate" onSelect={noop} />
          <DropdownMenuItem label="Log out" destructive onSelect={noop} />
        </DropdownMenuContent>
      </DropdownMenu>
    </Stage>
  );
}

function EmptyStateShowcase({ align }: Props) {
  return (
    <Stage>
      <EmptyState align={align}>
        <EmptyStateIcon>{(color: string) => <InfoIcon color={color} />}</EmptyStateIcon>
        <EmptyStateTitle>No messages yet</EmptyStateTitle>
        <EmptyStateDescription>New mail shows up here.</EmptyStateDescription>
        <EmptyStateActions>
          <Button onPress={noop}>Compose</Button>
        </EmptyStateActions>
      </EmptyState>
    </Stage>
  );
}

function FabShowcase({ placement, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.fabArea}>
      <FAB accessibilityLabel="Add item" icon={<PlusIcon size={24} color={colors.primaryForeground} />} placement={placement} disabled={disabled} onPress={noop} />
    </View>
  );
}

function RadioGroupShowcase({ disabled }: Props) {
  return (
    <Stage>
      <RadioGroup defaultValue="b" disabled={disabled}>
        {[
          ['a', 'Starter'],
          ['b', 'Team'],
          ['c', 'Enterprise'],
        ].map(([value, text]) => (
          <RadioGroupItem key={value} value={value} label={text} />
        ))}
      </RadioGroup>
    </Stage>
  );
}

function SegmentedControlShowcase({ disabled }: Props) {
  const [range, setRange] = useState('week');
  return (
    <Stage>
      <SegmentedControl
        value={range}
        onValueChange={setRange}
        disabled={disabled}
        segments={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
    </Stage>
  );
}

function SelectShowcase() {
  return (
    <Stage>
      <Select {...OPEN} defaultValue="fr">
        <SelectTrigger placeholder="Pick a country" />
        <SelectContent>
          <SelectItem value="fr" label="France" />
          <SelectItem value="jp" label="Japan" />
          <SelectItem value="br" label="Brazil" />
        </SelectContent>
      </Select>
    </Stage>
  );
}

function SheetShowcase() {
  return (
    <Sheet {...OPEN}>
      <SheetTrigger asChild>
        <Button>Open sheet</Button>
      </SheetTrigger>
      <SheetContent sheetHeight={280}>
        <SheetHeader>
          <SheetTitle>Share project</SheetTitle>
        </SheetHeader>
        <Text tone="muted">Anyone with the link can view.</Text>
        <SheetFooter>
          <Button variant="primary">Copy link</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function TabsShowcase() {
  return (
    <Stage>
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Overview</TabsTrigger>
          <TabsTrigger value="two">Activity</TabsTrigger>
          <TabsTrigger value="three">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Text>Everything at a glance.</Text>
        </TabsContent>
        <TabsContent value="two">
          <Text>Recent changes land here.</Text>
        </TabsContent>
        <TabsContent value="three">
          <Text>Tune the workspace.</Text>
        </TabsContent>
      </Tabs>
    </Stage>
  );
}

function TextShowcase({ variant = 'body', tone }: Props) {
  return (
    <Stage>
      <Text variant={variant} tone={tone}>
        The quick brown fox jumps over the lazy dog.
      </Text>
    </Stage>
  );
}

function LabelShowcase({ disabled, required }: Props) {
  return (
    <Stage>
      <Label disabled={disabled} required={required}>
        Email address
      </Label>
    </Stage>
  );
}

function MarqueeShowcase({ disabled }: Props) {
  return (
    <Stage>
      <Marquee text="Free shipping over $50" divider=" // " disabled={disabled} />
    </Stage>
  );
}

// Rows are pinned: on web an unbounded multiline field re-measures its own grown height forever.
function TextareaShowcase({ invalid, disabled, required }: Props) {
  return (
    <Stage>
      <Textarea
        label="Message"
        description="Tell us what happened."
        placeholder="Write something..."
        errorMessage="Message is required."
        invalid={invalid}
        disabled={disabled}
        required={required}
        minRows={3}
        maxRows={3}
      />
    </Stage>
  );
}

function ToastShowcase({ variant }: Props) {
  const [visible, setVisible] = useState(true);
  return (
    <View style={styles.toastArea}>
      <Toast
        visible={visible}
        title="Saved"
        description="report.pdf is ready."
        variant={variant}
        duration={HOLD}
        onDismiss={() => setVisible(false)}
        style={styles.toastInFlow}
      />
      {!visible && <Button onPress={() => setVisible(true)}>Show toast</Button>}
    </View>
  );
}

function ToasterDemo() {
  const toast = useToast();
  useEffect(() => {
    toast({ title: 'Saved', description: 'Changes synced.', duration: HOLD });
    toast({ title: 'Uploaded', description: 'report.pdf is ready.', variant: 'success', duration: HOLD });
  }, [toast]);
  return (
    <View style={styles.toastArea}>
      <View style={styles.toasterSpacer} />
      <Button variant="primary" onPress={() => toast.error('Could not save', 'You are offline.')}>
        Fire a toast
      </Button>
    </View>
  );
}

function ToasterShowcase() {
  return (
    <Toaster>
      <ToasterDemo />
    </Toaster>
  );
}

const SHOWCASES: Record<string, ComponentType<any>> = {
  Accordion: AccordionShowcase,
  Alert: AlertShowcase,
  AlertDialog: AlertDialogShowcase,
  AppBar: AppBarShowcase,
  BottomNav: BottomNavShowcase,
  Card: CardShowcase,
  Carousel: CarouselShowcase,
  DatePicker: DatePickerShowcase,
  Dialog: DialogShowcase,
  Drawer: DrawerShowcase,
  DropdownMenu: DropdownMenuShowcase,
  EmptyState: EmptyStateShowcase,
  FAB: FabShowcase,
  RadioGroup: RadioGroupShowcase,
  SegmentedControl: SegmentedControlShowcase,
  Select: SelectShowcase,
  Sheet: SheetShowcase,
  Tabs: TabsShowcase,
  Label: LabelShowcase,
  Marquee: MarqueeShowcase,
  Text: TextShowcase,
  Textarea: TextareaShowcase,
  Toast: ToastShowcase,
  Toaster: ToasterShowcase,
};

export function resolveShowcase(name: string): ComponentType<any> | null {
  return SHOWCASES[name] ?? null;
}

const styles = StyleSheet.create({
  stage: { padding: 16 },
  bottom: { flex: 1, justifyContent: 'flex-end' },
  slide: { height: 140, padding: 16, gap: 8, justifyContent: 'center', borderWidth: 3 },
  fabArea: { flex: 1, minHeight: 240 },
  toastArea: { padding: 16, gap: 12, minHeight: 160 },
  toastInFlow: { position: 'relative', top: 0, left: 0, right: 0 },
  toasterSpacer: { height: 120 },
});
