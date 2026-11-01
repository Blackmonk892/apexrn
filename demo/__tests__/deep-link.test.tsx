import { Linking } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

function openWith(url: string | null) {
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(url);
}

afterEach(() => jest.restoreAllMocks());

describe('deep links', () => {
  it('opens the screen named by apexrn-demo://c/<id>', async () => {
    openWith('apexrn-demo://c/button');
    await render(<App />);
    expect(await screen.findByTestId('screen-button')).toBeTruthy();
  });

  it('falls back to Home for an unknown id', async () => {
    openWith('apexrn-demo://c/nope');
    await render(<App />);
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
  });

  it('opens Home when launched without a link', async () => {
    openWith(null);
    await render(<App />);
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
  });
});
