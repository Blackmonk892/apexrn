import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import ButtonScreen from './src/screens/ButtonScreen';
import CardScreen from './src/screens/CardScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  // Simple state router rendering one screen per component
  const renderScreen = () => {
    switch (currentScreen) {
      case 'button':
        return <ButtonScreen onBack={() => setCurrentScreen('home')} />;
      case 'card':
        return <CardScreen onBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBar style="auto" />
        {renderScreen()}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}