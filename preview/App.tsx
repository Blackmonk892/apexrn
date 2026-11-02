import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApexRNProvider, useTheme, type PresetName } from '@apexrn/ui';

import { ExampleScreen } from './src/example-screen';
import { PreviewErrorBoundary } from './src/error-boundary';
import { isPresetMessage, isRenderMessage, isThemeMessage, postToParent, type PreviewTheme, type RenderMessage } from './src/protocol';
import { resolveComponent } from './src/registry';
import { useRoute, type Route } from './src/route';
import { Showcase } from './src/showcase';

function isEmbed(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('embed') === '1';
}

/** Lets a plain, non-embedded URL (`?component=Button&theme=dark`) drive the
 * preview too, so it's independently testable without a parent postMessage. */
function initialRenderMessage(): RenderMessage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const component = params.get('component');
  if (!component) return null;
  const theme = params.get('theme');
  return {
    type: 'apexrn:render',
    component,
    props: {},
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
  };
}

function initialPreset(): PresetName {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'neo';
  return new URLSearchParams(window.location.search).get('preset') === 'raw' ? 'raw' : 'neo';
}

function isShowcaseQuery(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('view') === 'showcase';
}

/** `?theme=` seeds the provider for routes that have no render message; later changes arrive as `apexrn:theme`. */
function initialTheme(): PreviewTheme {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'system';
  const theme = new URLSearchParams(window.location.search).get('theme');
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

/** Applies a theme message to the provider's own state, so nothing remounts. */
function ModeSync({ mode }: { mode: 'light' | 'dark' | null }) {
  const { setMode } = useTheme();
  useEffect(() => {
    if (mode) setMode(mode);
  }, [mode, setMode]);
  return null;
}

export default function App() {
  const embed = isEmbed();
  const route = useRoute();
  const [message, setMessage] = useState<RenderMessage | null>(initialRenderMessage);
  const [mode, setMode] = useState<'light' | 'dark' | null>(null);
  const [preset, setPreset] = useState<PresetName>(initialPreset);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    function onMessage(event: MessageEvent) {
      if (isRenderMessage(event.data)) {
        setMessage(event.data);
      } else if (isThemeMessage(event.data)) {
        setMode(event.data.mode);
      } else if (isPresetMessage(event.data)) {
        setPreset(event.data.preset);
      }
    }
    window.addEventListener('message', onMessage);
    postToParent({ type: 'apexrn:ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const theme: PreviewTheme = message?.theme ?? initialTheme();

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ApexRNProvider defaultMode={theme} preset={preset}>
          <ModeSync mode={mode} />
          <PreviewRoot embed={embed} message={message} route={route} />
        </ApexRNProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function PreviewRoot({ embed, message, route }: { embed: boolean; message: RenderMessage | null; route: Route }) {
  const { colors } = useTheme();

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    postToParent({ type: 'apexrn:resize', height: Math.ceil(e.nativeEvent.layout.height) });
  }, []);

  if (route.kind === 'example') return <ExampleScreen slug={route.slug} id={route.id} />;

  return (
    <View
      style={[styles.root, { backgroundColor: embed ? 'transparent' : colors.background }]}
      onLayout={handleLayout}
    >
      <PreviewErrorBoundary>
        {message ? <RenderedComponent message={message} /> : route.kind === 'showcase' || isShowcaseQuery() ? <Showcase /> : !embed ? <Placeholder /> : null}
      </PreviewErrorBoundary>
    </View>
  );
}

function RenderedComponent({ message }: { message: RenderMessage }) {
  const Component = resolveComponent(message.component);
  if (!Component) {
    throw new Error(`Unknown ApexRN component: "${message.component}"`);
  }
  return <Component {...(message.props ?? {})} />;
}

function Placeholder() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        ApexRN preview runtime. Pass ?component=Button&embed=1 or postMessage
        {'\n'}
        {'{ type: "apexrn:render", component, props, theme }'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  placeholder: { padding: 24 },
  placeholderText: { fontSize: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
});
