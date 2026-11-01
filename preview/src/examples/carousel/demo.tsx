import { View } from 'react-native';
import { Carousel, Text } from '@/components/apexrn';

const slides = [
  { id: 'a', title: 'Pick a plan', body: 'Start free and upgrade when you need more.' },
  { id: 'b', title: 'Invite your team', body: 'Everyone gets their own login.' },
  { id: 'c', title: 'Ship it', body: 'Publish to the store in one tap.' },
];

export default function CarouselExample() {
  return (
    <View style={{ width: 320 }}>
      <Carousel
        data={slides}
        keyExtractor={(slide) => slide.id}
        showIndicators
        renderItem={({ item }) => (
          <View style={{ height: 140, padding: 16, gap: 8, justifyContent: 'center' }}>
            <Text variant="title">{item.title}</Text>
            <Text tone="muted">{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}
