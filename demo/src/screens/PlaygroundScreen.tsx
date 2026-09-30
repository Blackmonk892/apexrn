import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import { PLAYGROUND_RENDERERS, type PlaygroundProps } from '../playground/registry';

/**
 * Single-instance live specimen driven entirely by `apexrn:playgroundProps` messages from the website's
 * control panel — unlike the per-component screens (states matrix), this renders exactly one real
 * component instance whose props change in place, so the iframe never reloads for a control change.
 */
export default function PlaygroundScreen({ componentId, onBack }: { componentId: string; onBack: () => void }) {
  const { colors } = useTheme();
  const [props, setProps] = useState<PlaygroundProps>({});

  useEffect(() => {
    setProps({});
  }, [componentId]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'apexrn:playgroundProps' && e.data.component === componentId && e.data.props) {
        setProps((prev) => ({ ...prev, ...e.data.props }));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [componentId]);

  const renderer = PLAYGROUND_RENDERERS[componentId];

  return (
    <Layout title={`PLAYGROUND · ${componentId.toUpperCase()}`} onBack={onBack}>
      <View style={[styles.stage, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        {renderer ? (
          renderer(props)
        ) : (
          <Text style={[styles.empty, { color: colors.foreground }]}>
            No playground specimen registered for &ldquo;{componentId}&rdquo;.
          </Text>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stage: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: 24,
  },
  empty: { fontSize: 13, textAlign: 'center' },
});
