import React, { useState } from 'react';
import { BellIcon, HomeIcon, SegmentedControl, Text as UIText, UserIcon } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function SegmentedControlScreen({ onBack }: { onBack: () => void }) {
  const [range, setRange] = useState('week');

  return (
    <Layout id="segmentedcontrol" title="SEGMENTED CONTROL" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. The selected segment is an inverted block that slides into place.">
        <SegmentedControl
          value={range}
          onValueChange={setRange}
          accessibilityLabel="Time range"
          segments={[
            { value: 'day', label: 'Day', testID: 'segment-day' },
            { value: 'week', label: 'Week', testID: 'segment-week' },
            { value: 'month', label: 'Month', testID: 'segment-month' },
          ]}
        />
        <UIText variant="mono" testID="segmented-log">{`Value: ${range}`}</UIText>
      </Section>

      <Section title="Uncontrolled, two segments" note="defaultValue keeps its own state.">
        <SegmentedControl
          defaultValue="list"
          accessibilityLabel="Layout"
          segments={[
            { value: 'list', label: 'List' },
            { value: 'grid', label: 'Grid' },
          ]}
        />
      </Section>

      <Section title="With icons" note="Icons take the segment's own pair, so they invert with the block.">
        <SegmentedControl
          defaultValue="home"
          accessibilityLabel="View"
          segments={[
            { value: 'home', label: 'Home', icon: HomeIcon },
            { value: 'alerts', label: 'Alerts', icon: BellIcon },
            { value: 'me', label: 'Me', icon: UserIcon },
          ]}
        />
      </Section>

      <Section title="States" note="A disabled segment is skipped; a disabled control is dashed and shadowless.">
        <SegmentedControl
          defaultValue="free"
          accessibilityLabel="Plan"
          segments={[
            { value: 'free', label: 'Free' },
            { value: 'team', label: 'Team' },
            { value: 'enterprise', label: 'Enterprise', disabled: true },
          ]}
        />
        <SegmentedControl
          disabled
          defaultValue="a"
          accessibilityLabel="Locked"
          segments={[
            { value: 'a', label: 'Monthly' },
            { value: 'b', label: 'Yearly' },
          ]}
        />
      </Section>

      <Section title="Edge cases" note="Five segments with long labels stay equal width and truncate to one line.">
        <SegmentedControl
          defaultValue="p1"
          accessibilityLabel="Pipeline"
          segments={[
            { value: 'p1', label: 'Backlog' },
            { value: 'p2', label: 'In progress' },
            { value: 'p3', label: 'In review' },
            { value: 'p4', label: 'Shipped' },
            { value: 'p5', label: 'Archived' },
          ]}
        />
      </Section>
    </Layout>
  );
}
