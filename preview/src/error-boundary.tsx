import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { postToParent } from './protocol';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches a bad component name or a throwing render and reports it to the
 * parent instead of taking down the whole preview document.
 */
export class PreviewErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    postToParent({ type: 'apexrn:error', message: error.message });
  }

  componentDidUpdate(prevProps: Props) {
    // A new render request (new children) gets a fresh chance even after a
    // prior failure, instead of being stuck on the old error forever.
    if (this.props.children !== prevProps.children && this.state.error) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.box}>
          <Text style={styles.text}>Preview error: {this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: { padding: 16 },
  text: { color: '#D32F2F', fontSize: 13 },
});
