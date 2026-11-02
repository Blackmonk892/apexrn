import React, { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { examples } from './examples';
import { PreviewErrorBoundary } from './error-boundary';
import { postToParent } from './protocol';

function ExampleBody({ slug, id }: { slug: string; id: string }) {
  const Example = examples[slug]?.[id];
  if (!Example) throw new Error(`Unknown example: "${slug}/${id}"`);
  return <Example />;
}

/** One example, centred and unframed. The measured wrapper hugs its content (the
 * root is the flex:1 part), so the parent iframe can shrink to fit. */
export function ExampleScreen({ slug, id }: { slug: string; id: string }) {
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    postToParent({ type: 'apexrn:resize', height: Math.ceil(e.nativeEvent.layout.height) });
  }, []);

  // The iframe sits on the website's own surface, so the document must not paint over it.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.content} onLayout={onLayout}>
        <PreviewErrorBoundary key={`${slug}/${id}`}>
          <View style={styles.holder}>
            <ExampleBody slug={slug} id={id} />
          </View>
        </PreviewErrorBoundary>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  content: { width: '100%', alignItems: 'center', padding: 32 },
  // Shrink-wraps the example, so parts that sit at flex-start end up centred with it.
  holder: { maxWidth: '100%' },
});
