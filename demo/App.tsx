import React, { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useShowcaseTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
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
import TabsScreen from './src/screens/TabsScreen';
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

// Web only: `#button` opens the Button screen directly, `#button:light` also forces
// the theme (used for headless checks).
function initialScreen(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'home';
  return window.location.hash.replace('#', '').split(':')[0] || 'home';
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
  const { isDark } = useShowcaseTheme();
  const [currentScreen, setCurrentScreen] = useState<string>(initialScreen);

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
      case 'datepicker': return <DatePickerScreen onBack={() => setCurrentScreen('home')} />;
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