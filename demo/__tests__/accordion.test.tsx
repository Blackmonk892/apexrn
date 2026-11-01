import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Text } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Faq(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="shipping">
        <AccordionTrigger testID="t-shipping">Shipping</AccordionTrigger>
        <AccordionContent><Text>Ships in two days.</Text></AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger testID="t-returns">Returns</AccordionTrigger>
        <AccordionContent><Text>Thirty day returns.</Text></AccordionContent>
      </AccordionItem>
      <AccordionItem value="support" disabled>
        <AccordionTrigger testID="t-support">Support</AccordionTrigger>
        <AccordionContent><Text>Reply within a day.</Text></AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Faq defaultValue="shipping" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getAllByRole('button')).toHaveLength(3);
      expect(view.getByText('Ships in two days.')).toBeTruthy();
    }
  });

  it('works uncontrolled: single mode swaps the open item', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Faq defaultValue="shipping" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('t-returns'));
    expect(onValueChange).toHaveBeenCalledWith('returns');
    expect(screen.getByText('Thirty day returns.')).toBeTruthy();
    expect(screen.queryByText('Ships in two days.')).toBeNull();
  });

  it('closes the open item in single mode and reports an empty string', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Faq defaultValue="shipping" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('t-shipping'));
    expect(onValueChange).toHaveBeenCalledWith('');
    expect(screen.queryByText('Ships in two days.')).toBeNull();
  });

  it('keeps several items open in multiple mode', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Faq type="multiple" defaultValue={['shipping']} onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('t-returns'));
    expect(onValueChange).toHaveBeenCalledWith(['shipping', 'returns']);
    expect(screen.getByText('Ships in two days.')).toBeTruthy();
    expect(screen.getByText('Thirty day returns.')).toBeTruthy();
  });

  it('works controlled: the display follows value, not taps', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Faq value="shipping" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('t-returns'));
    expect(onValueChange).toHaveBeenCalledWith('returns');
    expect(screen.getByText('Ships in two days.')).toBeTruthy();
    expect(screen.queryByText('Thirty day returns.')).toBeNull();
  });

  it('reports expanded state on the trigger', async () => {
    await renderWithTheme(<Faq defaultValue="shipping" />);
    expect(screen.getByRole('button', { name: 'Shipping' })).toBeExpanded();
    expect(screen.getByRole('button', { name: 'Returns' })).not.toBeExpanded();
  });

  it('ignores a disabled item', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Faq onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('t-support'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Support' })).toBeDisabled();
  });

  it('gives each trigger a 44 hit target', async () => {
    await renderWithTheme(<Faq />);
    expect(StyleSheet.flatten(screen.getByTestId('t-shipping').props.style).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('throws when parts are used outside their parents', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<AccordionItem value="a">{null}</AccordionItem>)).rejects.toThrow(
      'AccordionItem must be used within Accordion',
    );
    await expect(
      renderWithTheme(
        <Accordion>
          <AccordionTrigger>A</AccordionTrigger>
        </Accordion>,
      ),
    ).rejects.toThrow('AccordionTrigger must be used within AccordionItem');
    await expect(
      renderWithTheme(
        <Accordion>
          <AccordionContent><Text>A</Text></AccordionContent>
        </Accordion>,
      ),
    ).rejects.toThrow('AccordionContent must be used within AccordionItem');
    spy.mockRestore();
  });
});
