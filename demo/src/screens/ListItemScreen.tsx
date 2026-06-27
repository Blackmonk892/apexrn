import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import ListItem from '@ui/components/listitem';
import Badge from '@ui/components/badge';
import Avatar from '@ui/components/avatar';

export default function ListItemScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="LIST ITEM COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT</Text>
        <View style={styles.listContainer}>
          <ListItem title="Notifications" />
          <ListItem title="Privacy Settings" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH DESCRIPTION & LEADING/TRAILING</Text>
        <View style={styles.listContainer}>
          <ListItem 
            title="Alex Johnson" 
            description="Hey, are we still on for tomorrow?"
            leading={<Avatar size="sm" initials="AJ" />}
            trailing={<Text style={{ fontWeight: 'bold' }}>12:30</Text>}
          />
          <ListItem 
            title="System Alert" 
            description="Your backup is complete."
            leading={<Text style={{ fontSize: 24 }}>🔔</Text>}
            trailing={<Badge variant="accent" label="NEW" />}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED STATE</Text>
        <View style={styles.listContainer}>
          <ListItem 
            title="Delete Account" 
            description="This action is not available right now."
            disabled 
          />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  listContainer: { borderWidth: 4, borderColor: '#000', borderBottomWidth: 0 },
});
