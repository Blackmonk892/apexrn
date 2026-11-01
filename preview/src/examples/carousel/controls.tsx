import { View } from 'react-native';
import { Carousel, Text } from '@/components/apexrn';

const photos = ['Harbour', 'Old town', 'Market', 'Viewpoint'];

export default function CarouselControlsExample() {
  return (
    <View style={{ width: 320 }}>
      <Carousel
        data={photos}
        keyExtractor={(name) => name}
        showControls
        showIndicators
        renderItem={({ item, index }) => (
          <View style={{ height: 140, padding: 16, justifyContent: 'center' }}>
            <Text variant="mono" tone="muted">{`${index + 1} / ${photos.length}`}</Text>
            <Text variant="title">{item}</Text>
          </View>
        )}
      />
    </View>
  );
}
