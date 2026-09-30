import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApexRNProvider, useTheme } from '@apexrn/ui';

import { PreviewErrorBoundary } from './src/error-boundary';
import { isRenderMessage, postToParent, type PreviewTheme, type RenderMessage } from './src/protocol';
import { resolveComponent } from './src/registry';

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

export default function App() {
  const embed = isEmbed();
  const [message, setMessage] = useState<RenderMessage | null>(initialRenderMessage);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (isRenderMessage(event.data)) {
        setMessage(event.data);
      }
    }
    window.addEventListener('message', onMessage);
    postToParent({ type: 'apexrn:ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const theme: PreviewTheme = message?.theme ?? 'system';

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ApexRNProvider defaultMode={theme}>
          <PreviewRoot embed={embed} message={message} />
        </ApexRNProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function PreviewRoot({ embed, message }: { embed: boolean; message: RenderMessage | null }) {
  const { colors } = useTheme();

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    postToParent({ type: 'apexrn:resize', height: Math.ceil(e.nativeEvent.layout.height) });
  }, []);

  return (
    <View
      style={[styles.root, { backgroundColor: embed ? 'transparent' : colors.background }]}
      onLayout={handleLayout}
    >
      <PreviewErrorBoundary>
        {message ? <RenderedComponent message={message} /> : !embed ? <Placeholder /> : null}
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
