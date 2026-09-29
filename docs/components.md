# ApexRN components

Every example below is a complete component you can paste into a screen. They assume the CLI's default layout: components in `components/apexrn` (with a generated `index.ts`) and shared files in `lib/apexrn`. Adjust the `@/` alias to your project.

```bash
npx apexrn init
npx apexrn add button card dialog     # dependencies come along automatically
```

## Setup (once)

```tsx
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from '@/components/apexrn';
import { ApexRNProvider } from '@/lib/apexrn/theme';

// Wrap your navigation / screens in this (for Expo Router, use it in app/_layout.tsx).
export function Providers({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApexRNProvider defaultMode="system">
        <Toaster>{children}</Toaster>
      </ApexRNProvider>
    </GestureHandlerRootView>
  );
}
```

`Toaster` is optional and only needed if you use `toast()`. `GestureHandlerRootView` is needed by Slider, Sheet, Drawer and everything built on them.

## Rules that apply to every component

- **Import from the barrel:** `import { Button, Card } from '@/components/apexrn'`. Every component is also a named export from its own file.
- **Controlled or uncontrolled.** Anything with state takes `value` / `defaultValue` / `onValueChange` (or `open` / `defaultOpen` / `onOpenChange`, or `checked` / `defaultChecked` / `onCheckedChange`). Omit the controlled prop and it manages itself. `Sheet` is the one exception: it is controlled only.
- **Variants** share one vocabulary: `default`, `primary`, `accent`, `outline` for looks and `destructive`, `success`, `warning` for status. Status variants add a glyph or spoken prefix, so they are never colour-only.
- **Styling.** `style` targets the outer wrapper. Some components add named parts (`inputStyle`, `surfaceStyle`). To restyle everything, edit `lib/apexrn/colors.ts`. Text colours must meet 4.5:1; run `npm run tokens:check` in the ApexRN repo after changing tokens.
- **Safe areas.** `AppBar`, `Drawer` and `BottomNav` take `topInset` / `bottomInset`; `Toaster` takes `topInset`. Pass them from `useSafeAreaInsets()`.
- **Compound parts throw** a clear error if used outside their parent.

---

## Actions

### Button

```tsx
import { Button } from '@/components/apexrn';

export function SaveButton() {
  return (
    <>
      <Button variant="primary" onPress={() => console.log('saved')}>Save</Button>
      <Button variant="destructive" size="sm">Delete</Button>
      <Button variant="outline" loading>Uploading</Button>
      <Button title="Also works" disabled />
    </>
  );
}
```

Variants `default | primary | outline | destructive`, sizes `sm | md | lg`. `loading` keeps the width and blocks presses. `icon` + `iconPosition` add an icon.

### FAB

```tsx
import { Text } from 'react-native';
import { FAB } from '@/components/apexrn';

export function AddFab() {
  return (
    <FAB accessibilityLabel="Add item" onPress={() => {}}>
      <Text>+</Text>
    </FAB>
  );
}
```

### Chip

```tsx
import { useState } from 'react';
import { Chip } from '@/components/apexrn';

export function Filters() {
  const [tags, setTags] = useState(['Design', 'Code']);
  return (
    <>
      <Chip label="Open now" defaultSelected />
      {tags.map((t) => (
        <Chip key={t} label={t} onRemove={() => setTags((l) => l.filter((x) => x !== t))} />
      ))}
    </>
  );
}
```

## Display

### Card

```tsx
import { Button, Card, CardFooter, CardHeader, CardText } from '@/components/apexrn';

export function PlanCard() {
  return (
    <Card variant="accent">
      <CardHeader>
        <CardText tone="title">Pro plan</CardText>
      </CardHeader>
      <CardText tone="title">$9 / month</CardText>
      <CardText tone="muted">Unlimited projects.</CardText>
      <CardFooter>
        <Button variant="primary">Upgrade</Button>
      </CardFooter>
    </Card>
  );
}
```

Use `CardText` instead of `Text` inside a card: React Native text does not inherit colour, so `CardText` picks up the card variant's foreground. Give `Card` an `onPress` and it becomes a button.

### Badge

```tsx
import { Badge } from '@/components/apexrn';

export function Status() {
  return (
    <>
      <Badge variant="success">Live</Badge>
      <Badge variant="destructive" label="Failed" withShadow />
    </>
  );
}
```

### Avatar

```tsx
import { Avatar } from '@/components/apexrn';

export function Me() {
  return <Avatar size="lg" initials="JD" src="https://example.com/me.jpg" withShadow />;
}
```

Falls back to initials if the image fails to load.

### ListItem

```tsx
import { ListItem } from '@/components/apexrn';

export function SettingsRow() {
  return <ListItem title="Notifications" description="Manage alerts" onPress={() => {}} />;
}
```

### Accordion

```tsx
import { Text } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/apexrn';

export function Faq() {
  return (
    <Accordion type="single" defaultValue="a">
      <AccordionItem value="a">
        <AccordionTrigger>What is ApexRN?</AccordionTrigger>
        <AccordionContent>
          <Text>Brutalist components you own.</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

### Carousel

```tsx
import { Text, View } from 'react-native';
import { Carousel } from '@/components/apexrn';

const slides = [{ id: 'a', title: 'One' }, { id: 'b', title: 'Two' }];

export function Slides() {
  return (
    <Carousel
      data={slides}
      keyExtractor={(s) => s.id}
      showIndicators
      renderItem={({ item }) => (
        <View style={{ height: 140 }}>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
}
```

### Marquee, Separator, Skeleton, Progress

```tsx
import { Marquee, Progress, Separator, Skeleton } from '@/components/apexrn';

export function Bits() {
  return (
    <>
      <Marquee text="BREAKING NEWS" speed={50} />
      <Separator />
      <Skeleton style={{ height: 16, width: 160 }} />
      <Progress value={60} max={100} />
    </>
  );
}
```

## Feedback

### Alert

```tsx
import { Alert } from '@/components/apexrn';

export function Notice() {
  return <Alert variant="warning" title="Storage almost full" description="92% used." />;
}
```

### Toast (one line)

```tsx
import { Button, useToast } from '@/components/apexrn';

export function SaveWithToast() {
  const toast = useToast();
  return (
    <Button
      variant="primary"
      onPress={() => {
        toast('Saved');
        toast.success('Uploaded', 'report.pdf is ready.');
        toast.error('Could not save');
        toast({ title: 'Custom', variant: 'warning', duration: 5000 });
      }}
    >
      Save
    </Button>
  );
}
```

Needs `<Toaster>` at the app root (see Setup). Toasts queue: one shows at a time. Use the controlled `Toast` (`visible`, `onDismiss`) only if you need to own the state.

## Forms

### Input, Textarea, Label

```tsx
import { useState } from 'react';
import { Input, Label, Textarea } from '@/components/apexrn';

export function ProfileForm() {
  const [email, setEmail] = useState('');
  return (
    <>
      <Label>Email</Label>
      <Input value={email} onChangeText={setEmail} placeholder="you@example.com" error={!email.includes('@')} />
      <Label>Bio</Label>
      <Textarea placeholder="Tell us about you" />
    </>
  );
}
```

`Input` and `Textarea` are TextInputs, so they use React Native's `onChangeText`. They accept `error`, `disabled`, and `inputStyle` / `surfaceStyle`.

### Checkbox, Switch, RadioGroup

```tsx
import { View } from 'react-native';
import { Checkbox, RadioGroup, RadioGroupItem, Switch } from '@/components/apexrn';

export function Preferences() {
  return (
    <View>
      <Checkbox defaultChecked onCheckedChange={(v) => console.log(v)} />
      <Switch checked onCheckedChange={() => {}} />
      <RadioGroup defaultValue="a" onValueChange={(v) => console.log(v)}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    </View>
  );
}
```

### Slider

```tsx
import { useState } from 'react';
import { Slider } from '@/components/apexrn';

export function Volume() {
  const [v, setV] = useState(40);
  return <Slider value={v} onValueChange={setV} min={0} max={100} step={5} />;
}
```

Needs `GestureHandlerRootView` at the app root. `onSlidingComplete` fires on release.

### InputOTP

```tsx
import { InputOTP } from '@/components/apexrn';

export function Code() {
  return <InputOTP length={6} onChangeText={(code) => console.log(code)} />;
}
```

### SearchBar

```tsx
import { useState } from 'react';
import { SearchBar } from '@/components/apexrn';

export function Search() {
  const [q, setQ] = useState('');
  return <SearchBar value={q} onValueChange={setQ} onSubmit={(v) => console.log('search', v)} onCancel={() => setQ('')} />;
}
```

### Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/apexrn';

export function Country() {
  return (
    <Select defaultValue="fr" onValueChange={(v) => console.log(v)}>
      <SelectTrigger placeholder="Pick a country" />
      <SelectContent>
        <SelectItem value="fr" label="France" />
        <SelectItem value="jp" label="Japan" />
      </SelectContent>
    </Select>
  );
}
```

### DatePicker

```tsx
import { DatePicker, DatePickerContent, DatePickerTrigger, formatLocalDate } from '@/components/apexrn';

export function Birthday() {
  return (
    <DatePicker onValueChange={(d) => console.log(formatLocalDate(d))}>
      <DatePickerTrigger placeholder="Pick a date" />
      <DatePickerContent />
    </DatePicker>
  );
}
```

## Overlays

### Dialog

```tsx
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/apexrn';

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
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
```

### AlertDialog

```tsx
import { AlertDialog, Button } from '@/components/apexrn';

export function DeleteAccount() {
  return (
    <AlertDialog
      title="Delete account?"
      description="This cannot be undone."
      actionText="Delete"
      onAction={() => console.log('deleted')}
    >
      <Button variant="destructive">Delete account</Button>
    </AlertDialog>
  );
}
```

The child is the trigger. Backdrop taps do nothing; Android back counts as Cancel. Use `destructive={false}` for a non-destructive action.

### Sheet

```tsx
import { useState } from 'react';
import { Text } from 'react-native';
import { Button, Sheet, SheetContent } from '@/components/apexrn';

export function Menu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open sheet</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        {({ handleDismiss }) => (
          <SheetContent sheetHeight={300}>
            <Text>Drag the handle down, or:</Text>
            <Button onPress={handleDismiss}>Close</Button>
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}
```

### DropdownMenu

```tsx
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/apexrn';

export function Actions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem label="Edit" onPress={() => {}} />
        <DropdownMenuItem label="Log out" onPress={() => {}} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Navigation

### Tabs

```tsx
import { Text } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/apexrn';

export function Sections() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one"><Text>First</Text></TabsContent>
      <TabsContent value="two"><Text>Second</Text></TabsContent>
    </Tabs>
  );
}
```

### AppBar

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBar, AppBarAction } from '@/components/apexrn';
import { SearchIcon } from '@/lib/apexrn/icons';

export function Header() {
  const insets = useSafeAreaInsets();
  return (
    <AppBar
      title="Inbox"
      topInset={insets.top}
      onBack={() => {}}
      trailing={<AppBarAction label="Search" icon={(c) => <SearchIcon size={20} color={c} />} onPress={() => {}} />}
    />
  );
}
```

### BottomNav

```tsx
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav, BottomNavItem } from '@/components/apexrn';
import { BellIcon, HomeIcon } from '@/lib/apexrn/icons';

export function Tabbar() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('home');
  return (
    <BottomNav value={tab} onValueChange={setTab} bottomInset={insets.bottom}>
      <BottomNavItem value="home" label="Home" icon={(c) => <HomeIcon size={22} color={c} />} />
      <BottomNavItem value="alerts" label="Alerts" badge={3} icon={(c) => <BellIcon size={22} color={c} />} />
    </BottomNav>
  );
}
```

### Drawer

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerItem, DrawerTrigger } from '@/components/apexrn';

export function SideMenu() {
  const insets = useSafeAreaInsets();
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Menu</Button>
      </DrawerTrigger>
      <DrawerContent topInset={insets.top} bottomInset={insets.bottom}>
        <DrawerHeader title="ApexRN" subtitle="Signed in" />
        <DrawerItem label="Home" active onPress={() => {}} />
        <DrawerItem label="Inbox" badge={12} onPress={() => {}} />
      </DrawerContent>
    </Drawer>
  );
}
```

Items close the drawer unless `closeOnPress={false}`. Swipe toward the edge or press Android back to close.

---

## Primitive

### BrutalSurface

The block every component is built on: border, hard offset shadow and press physics. Use it for your own blocky elements so they match.

```tsx
import { Text } from 'react-native';
import { BrutalSurface } from '@/components/apexrn';

export function Tile() {
  return (
    <BrutalSurface pressable onPress={() => {}} accessibilityRole="button" accessibilityLabel="Open tile">
      <Text>Tap me</Text>
    </BrutalSurface>
  );
}
```
