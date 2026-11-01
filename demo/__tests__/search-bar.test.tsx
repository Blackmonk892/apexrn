import { fireEvent, screen } from '@testing-library/react-native';
import { SearchBar } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

describe('SearchBar', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<SearchBar testID="q" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) expect(view.getByTestId('q')).toBeTruthy();
  });

  it('exposes the search role on its container', async () => {
    await renderWithTheme(<SearchBar testID="q" />);
    expect(JSON.stringify(screen.toJSON())).toContain('"accessibilityRole":"search"');
  });

  it('shows clear only with text, clears, and reports the change', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<SearchBar testID="q" defaultValue="ab" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByLabelText('Clear search'));
    expect(onValueChange).toHaveBeenCalledWith('');
    expect(screen.getByTestId('q').props.value).toBe('');
    expect(screen.queryByLabelText('Clear search')).toBeNull();
  });

  it('keeps passing onChangeText through', async () => {
    const onChangeText = jest.fn();
    await renderWithTheme(<SearchBar testID="q" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByTestId('q'), 'x');
    expect(onChangeText).toHaveBeenCalledWith('x');
  });

  it('submits the current query', async () => {
    const onSubmit = jest.fn();
    await renderWithTheme(<SearchBar testID="q" value="shoes" onSubmit={onSubmit} />);
    await fireEvent(screen.getByTestId('q'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalledWith('shoes');
  });

  it('lists recent searches while empty, focused or not, and fills on press', async () => {
    const onRecentPress = jest.fn();
    await renderWithTheme(<SearchBar testID="q" recent={['alpha', 'beta']} onRecentPress={onRecentPress} />);
    expect(screen.getByText('beta')).toBeTruthy();
    await fireEvent(screen.getByTestId('q'), 'blur');
    expect(screen.getByText('beta')).toBeTruthy();
    await fireEvent.press(screen.getByText('alpha'));
    expect(onRecentPress).toHaveBeenCalledWith('alpha');
    expect(screen.getByTestId('q').props.value).toBe('alpha');
    expect(screen.queryByText('beta')).toBeNull();
  });
});
