import { screen, within } from '@testing-library/react-native';
import SpecimenScreen from '../src/screens/specimen/SpecimenScreen';
import { renderWithTheme } from './utils/render';

const QUADRANTS = ['neo-light', 'neo-dark', 'raw-light', 'raw-dark'] as const;

describe('SpecimenScreen', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => errorSpy.mockRestore());

  it('renders one quadrant per preset and scheme', async () => {
    await renderWithTheme(<SpecimenScreen onBack={() => {}} />);
    for (const id of QUADRANTS) expect(screen.getByTestId(`quadrant-${id}`)).toBeTruthy();
  });

  it('gives each quadrant a title testID for the e2e scroll targets', async () => {
    await renderWithTheme(<SpecimenScreen onBack={() => {}} />);
    for (const id of QUADRANTS) expect(screen.getByTestId(`quadrant-title-${id}`)).toBeTruthy();
  });

  it.each(QUADRANTS)('%s lists all 23 colour roles and the 5 type roles', async (id) => {
    await renderWithTheme(<SpecimenScreen onBack={() => {}} />);
    const quadrant = within(screen.getByTestId(`quadrant-${id}`));
    expect(quadrant.getAllByTestId(/^role-/)).toHaveLength(23);
    expect(quadrant.getByTestId('role-scrim')).toBeTruthy();
    expect(quadrant.getAllByTestId(/^type-/)).toHaveLength(5);
  });

  it('shows the card step at 4 in neo and 2 in raw', async () => {
    await renderWithTheme(<SpecimenScreen onBack={() => {}} />);
    const card = (id: string) => within(screen.getByTestId(`quadrant-${id}`)).getByTestId('depth-card');
    expect(card('neo-light')).toHaveTextContent('4px');
    expect(card('neo-dark')).toHaveTextContent('4px');
    expect(card('raw-light')).toHaveTextContent('2px');
    expect(card('raw-dark')).toHaveTextContent('2px');
  });

  it('computes contrast from the active palette', async () => {
    await renderWithTheme(<SpecimenScreen onBack={() => {}} />);
    const neoLight = within(screen.getByTestId('quadrant-neo-light'));
    expect(within(neoLight.getByTestId('role-foreground')).getByText('21.00:1')).toBeTruthy();
  });

  it('renders without console errors', async () => {
    await renderWithTheme(<SpecimenScreen onBack={() => {}} />);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
