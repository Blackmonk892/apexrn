import React, { useEffect, useState } from 'react';
import { BackHandler, Linking, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useShowcaseTheme } from './src/context/ThemeContext';
import HomeScreen, { SCREEN_IDS } from './src/screens/HomeScreen';
import { screenFromUrl } from './src/deep-link';
import ButtonScreen from './src/screens/ButtonScreen';
import CardScreen from './src/screens/CardScreen';
import FormsScreen from './src/screens/FormsScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import DisplayScreen from './src/screens/DisplayScreen';
import OverlayScreen from './src/screens/OverlayScreen';
import NavigationScreen from './src/screens/NavigationScreen';

// Individual component screens
import InputScreen from './src/screens/InputScreen';
import CheckboxScreen from './src/screens/CheckboxScreen';
import RadioGroupScreen from './src/screens/RadioGroupScreen';
import SwitchScreen from './src/screens/SwitchScreen';
import SliderScreen from './src/screens/SliderScreen';
import BadgeScreen from './src/screens/BadgeScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SkeletonScreen from './src/screens/SkeletonScreen';
import AlertScreen from './src/screens/AlertScreen';
import ToastScreen from './src/screens/ToastScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import AccordionScreen from './src/screens/AccordionScreen';
import CarouselScreen from './src/screens/CarouselScreen';
import MarqueeScreen from './src/screens/MarqueeScreen';
import ListItemScreen from './src/screens/ListItemScreen';
import DialogScreen from './src/screens/DialogScreen';
import AlertDialogScreen from './src/screens/AlertDialogScreen';
import SheetScreen from './src/screens/SheetScreen';
import DropdownScreen from './src/screens/DropdownScreen';
import SelectScreen from './src/screens/SelectScreen';
import DatePickerScreen from './src/screens/DatePickerScreen';
import NumberInputScreen from './src/screens/NumberInputScreen';
import SegmentedControlScreen from './src/screens/SegmentedControlScreen';
import EmptyStateScreen from './src/screens/EmptyStateScreen';
import TabsScreen from './src/screens/TabsScreen';
import SettingsScreen from './src/screens/reference/SettingsScreen';
import CheckoutScreen from './src/screens/reference/CheckoutScreen';
import InboxScreen from './src/screens/reference/InboxScreen';
import SeparatorScreen from './src/screens/SeparatorScreen';
import FABScreen from './src/screens/FABScreen';
import LabelScreen from './src/screens/LabelScreen';
import InputOTPScreen from './src/screens/InputOTPScreen';
import TextareaScreen from './src/screens/TextareaScreen';
import AppBarScreen from './src/screens/AppBarScreen';
import DrawerScreen from './src/screens/DrawerScreen';
import BottomNavScreen from './src/screens/BottomNavScreen';
import SearchBarScreen from './src/screens/SearchBarScreen';
import ChipScreen from './src/screens/ChipScreen';

import ShowcaseScreen from './src/screens/ShowcaseScreen';
import PlaygroundScreen from './src/screens/PlaygroundScreen';
import SpecimenScreen from './src/screens/specimen/SpecimenScreen';

// Web only: `#button` opens the Button screen directly, `#button:light` also forces the theme
// (used for headless checks). `#playground:<component>:<theme?>` opens a single controllable
// live instance of that component instead of the states-matrix specimen.
function initialScreen(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'home';
  return window.location.hash.replace('#', '').split(':')[0] || 'home';
}

function initialPlaygroundComponent(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  const parts = window.location.hash.replace('#', '').split(':');
  return parts[0] === 'playground' ? parts[1] ?? '' : '';
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { isDark, setMode } = useShowcaseTheme();
  const [currentScreen, setCurrentScreen] = useState<string>(initialScreen);
  const [playgroundComponent, setPlaygroundComponent] = useState<string>(initialPlaygroundComponent);

  // Web window listeners for embed postMessage and hash changes
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleHashChange = () => {
      const parts = window.location.hash.replace('#', '').split(':');
      const scr = parts[0];
      if (!scr) return;
      setCurrentScreen(scr);
      if (scr === 'playground') setPlaygroundComponent(parts[1] ?? '');
    };

    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'apexrn:theme' && (e.data.mode === 'light' || e.data.mode === 'dark')) {
        setMode(e.data.mode);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('message', handleMessage);

    // Post ready signal to parent window if embedded
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'apexrn:ready' }, '*');
      } catch {
        // Ignore cross-origin error
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('message', handleMessage);
    };
  }, [setMode]);

  // Maestro and `adb` open screens with apexrn-demo://c/<id>, at launch or while the app runs.
  useEffect(() => {
    const open = (url: string | null) => {
      const id = screenFromUrl(url, SCREEN_IDS);
      if (id) setCurrentScreen(id);
    };
    Linking.getInitialURL().then(open, () => {});
    const sub = Linking.addEventListener('url', ({ url }) => open(url));
    return () => sub.remove();
  }, []);

  // Android hardware back navigates home instead of exiting the demo.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen !== 'home') {
        setCurrentScreen('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [currentScreen]);

  // Simple state router rendering one screen per component
  const renderScreen = () => {
    switch (currentScreen) {
      case 'playground':
        return (
          <PlaygroundScreen componentId={playgroundComponent} onBack={() => setCurrentScreen('home')} />
        );
      case 'specimen': return <SpecimenScreen onBack={() => setCurrentScreen('home')} />;
      case 'showcase': return <ShowcaseScreen onBack={() => setCurrentScreen('home')} />;
      case 'hero': return <ShowcaseScreen onBack={() => setCurrentScreen('home')} />;
      case 'button': return <ButtonScreen onBack={() => setCurrentScreen('home')} />;
      case 'card': return <CardScreen onBack={() => setCurrentScreen('home')} />;
      case 'forms': return <FormsScreen onBack={() => setCurrentScreen('home')} />;
      case 'feedback': return <FeedbackScreen onBack={() => setCurrentScreen('home')} />;
      case 'display': return <DisplayScreen onBack={() => setCurrentScreen('home')} />;
      case 'overlay': return <OverlayScreen onBack={() => setCurrentScreen('home')} />;
      case 'navigation': return <NavigationScreen onBack={() => setCurrentScreen('home')} />;
      
      // Individual component screens
      case 'input': return <InputScreen onBack={() => setCurrentScreen('home')} />;
      case 'checkbox': return <CheckboxScreen onBack={() => setCurrentScreen('home')} />;
      case 'radiogroup': return <RadioGroupScreen onBack={() => setCurrentScreen('home')} />;
      case 'switch': return <SwitchScreen onBack={() => setCurrentScreen('home')} />;
      case 'slider': return <SliderScreen onBack={() => setCurrentScreen('home')} />;
      case 'badge': return <BadgeScreen onBack={() => setCurrentScreen('home')} />;
      case 'progress': return <ProgressScreen onBack={() => setCurrentScreen('home')} />;
      case 'skeleton': return <SkeletonScreen onBack={() => setCurrentScreen('home')} />;
      case 'alert': return <AlertScreen onBack={() => setCurrentScreen('home')} />;
      case 'toast': return <ToastScreen onBack={() => setCurrentScreen('home')} />;
      case 'avatar': return <AvatarScreen onBack={() => setCurrentScreen('home')} />;
      case 'accordion': return <AccordionScreen onBack={() => setCurrentScreen('home')} />;
      case 'carousel': return <CarouselScreen onBack={() => setCurrentScreen('home')} />;
      case 'marquee': return <MarqueeScreen onBack={() => setCurrentScreen('home')} />;
      case 'listitem': return <ListItemScreen onBack={() => setCurrentScreen('home')} />;
      case 'dialog': return <DialogScreen onBack={() => setCurrentScreen('home')} />;
      case 'alertdialog': return <AlertDialogScreen onBack={() => setCurrentScreen('home')} />;
      case 'sheet': return <SheetScreen onBack={() => setCurrentScreen('home')} />;
      case 'dropdown': return <DropdownScreen onBack={() => setCurrentScreen('home')} />;
      case 'select': return <SelectScreen onBack={() => setCurrentScreen('home')} />;
      case 'emptystate': return <EmptyStateScreen onBack={() => setCurrentScreen('home')} />;
      case 'datepicker': return <DatePickerScreen onBack={() => setCurrentScreen('home')} />;
      case 'numberinput': return <NumberInputScreen onBack={() => setCurrentScreen('home')} />;
      case 'segmentedcontrol': return <SegmentedControlScreen onBack={() => setCurrentScreen('home')} />;
      case 'ref-settings': return <SettingsScreen onBack={() => setCurrentScreen('home')} />;
      case 'ref-checkout': return <CheckoutScreen onBack={() => setCurrentScreen('home')} />;
      case 'ref-inbox': return <InboxScreen onBack={() => setCurrentScreen('home')} />;
      case 'tabs': return <TabsScreen onBack={() => setCurrentScreen('home')} />;
      case 'separator': return <SeparatorScreen onBack={() => setCurrentScreen('home')} />;
      case 'fab': return <FABScreen onBack={() => setCurrentScreen('home')} />;
      case 'label': return <LabelScreen onBack={() => setCurrentScreen('home')} />;
      case 'input_otp': return <InputOTPScreen onBack={() => setCurrentScreen('home')} />;
      case 'textarea': return <TextareaScreen onBack={() => setCurrentScreen('home')} />;
      case 'appbar': return <AppBarScreen onBack={() => setCurrentScreen('home')} />;
      case 'drawer': return <DrawerScreen onBack={() => setCurrentScreen('home')} />;
      case 'bottomnav': return <BottomNavScreen onBack={() => setCurrentScreen('home')} />;
      case 'searchbar': return <SearchBarScreen onBack={() => setCurrentScreen('home')} />;
      case 'chip': return <ChipScreen onBack={() => setCurrentScreen('home')} />;

      default:
        return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {renderScreen()}
    </>
  );
}