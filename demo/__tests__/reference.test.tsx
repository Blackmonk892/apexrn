jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

import { renderInPalettes } from './utils/render';
import SettingsScreen from '../src/screens/reference/SettingsScreen';
import CheckoutScreen from '../src/screens/reference/CheckoutScreen';
import InboxScreen from '../src/screens/reference/InboxScreen';

const screens = [
  { id: 'ref-settings', element: <SettingsScreen onBack={() => {}} />, header: 'SETTINGS' },
  { id: 'ref-checkout', element: <CheckoutScreen onBack={() => {}} />, header: 'CHECKOUT' },
  { id: 'ref-inbox', element: <InboxScreen onBack={() => {}} />, header: 'INBOX' },
];

describe('reference screens', () => {
  it.each(screens)('$id renders in all four palettes with a header', async ({ id, element, header }) => {
    const results = await renderInPalettes(element);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByTestId(`screen-${id}`)).toBeTruthy();
      expect(view.getByText(header)).toBeTruthy();
    }
  });
});
