import { Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Carousel } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const data = ['a', 'b', 'c', 'd', 'e'];

function Deck(props: Partial<React.ComponentProps<typeof Carousel<string>>>) {
  return (
    <Carousel
      data={data}
      showIndicators
      showControls
      itemWidth={200}
      gap={16}
      renderItem={({ item }) => <Text>{`Card ${item}`}</Text>}
      {...props}
    />
  );
}

async function swipeTo(index: number, step = 216) {
  await fireEvent(screen.getByLabelText('Slide 1 of 5'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: index * step, y: 0 } },
  });
}

describe('Carousel', () => {
  it('renders in all four palettes with labelled slides and controls', async () => {
    const results = await renderInPalettes(<Deck />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByLabelText('Slide 2 of 5')).toBeTruthy();
      expect(view.getByLabelText('Previous slide')).toBeTruthy();
      expect(view.getByLabelText('Next slide')).toBeTruthy();
    }
  });

  it('works uncontrolled from defaultIndex and buttons', async () => {
    const onIndexChange = jest.fn();
    await renderWithTheme(<Deck defaultIndex={1} onIndexChange={onIndexChange} />);
    expect(screen.getByLabelText('Carousel, item 2 of 5')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Next slide'));
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(screen.getByLabelText('Carousel, item 3 of 5')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Previous slide'));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('follows a swipe', async () => {
    const onIndexChange = jest.fn();
    await renderWithTheme(<Deck onIndexChange={onIndexChange} />);
    await swipeTo(3);
    expect(onIndexChange).toHaveBeenCalledWith(3);
    expect(screen.getByLabelText('Carousel, item 4 of 5')).toBeTruthy();
  });

  it('works controlled: the display follows index, not swipes or taps', async () => {
    const onIndexChange = jest.fn();
    await renderWithTheme(<Deck index={0} onIndexChange={onIndexChange} />);
    await fireEvent.press(screen.getByLabelText('Next slide'));
    await swipeTo(2);
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(screen.getByLabelText('Carousel, item 1 of 5')).toBeTruthy();
  });

  it('disables previous at the start and next at the end', async () => {
    await renderWithTheme(<Deck index={0} />);
    expect(screen.getByLabelText('Previous slide')).toBeDisabled();
    expect(screen.getByLabelText('Next slide')).not.toBeDisabled();
  });

  it('disables next at the end', async () => {
    await renderWithTheme(<Deck index={4} />);
    expect(screen.getByLabelText('Next slide')).toBeDisabled();
    expect(screen.getByLabelText('Previous slide')).not.toBeDisabled();
  });

  it('does not fire callbacks from a disabled button', async () => {
    const onIndexChange = jest.fn();
    await renderWithTheme(<Deck index={0} onIndexChange={onIndexChange} />);
    await fireEvent.press(screen.getByLabelText('Previous slide'));
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it('hides indicators for a single slide', async () => {
    await renderWithTheme(<Deck data={['a']} showControls={false} />);
    expect(screen.getByLabelText('Carousel, item 1 of 1')).toBeTruthy();
  });

  it('renders empty data', async () => {
    await renderWithTheme(<Deck data={[]} />);
    expect(screen.getByLabelText('Carousel, item 0 of 0')).toBeTruthy();
  });
});
