import { StyleSheet, Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Account(props: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs {...props}>
      <TabsList accessibilityLabel="Account">
        <TabsTrigger value="profile" testID="tab-profile">Profile</TabsTrigger>
        <TabsTrigger value="billing" testID="tab-billing">Billing</TabsTrigger>
        <TabsTrigger value="admin" disabled testID="tab-admin">Admin</TabsTrigger>
      </TabsList>
      <TabsContent value="profile"><Text>Profile panel</Text></TabsContent>
      <TabsContent value="billing"><Text>Billing panel</Text></TabsContent>
      <TabsContent value="admin"><Text>Admin panel</Text></TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders in all four palettes with tablist and tab roles', async () => {
    const results = await renderInPalettes(<Account defaultValue="profile" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByLabelText('Account').props.accessibilityRole).toBe('tablist');
      expect(view.getAllByRole('tab')).toHaveLength(3);
    }
  });

  it('works uncontrolled from defaultValue', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Account defaultValue="profile" onValueChange={onValueChange} />);
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeSelected();
    expect(screen.getByText('Profile panel')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('tab-billing'));
    expect(onValueChange).toHaveBeenCalledWith('billing');
    expect(screen.getByRole('tab', { name: 'Billing' })).toBeSelected();
    expect(screen.getByText('Billing panel')).toBeTruthy();
    expect(screen.queryByText('Profile panel')).toBeNull();
  });

  it('works controlled: selection follows value, not taps', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Account value="profile" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('tab-billing'));
    expect(onValueChange).toHaveBeenCalledWith('billing');
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeSelected();
    expect(screen.getByText('Profile panel')).toBeTruthy();
  });

  it('ignores a disabled trigger and reports its state', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Account defaultValue="profile" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('tab-admin'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Admin' })).toBeDisabled();
  });

  it('gives each trigger a 44 hit target', async () => {
    await renderWithTheme(<Account defaultValue="profile" />);
    expect(StyleSheet.flatten(screen.getByTestId('tab-billing').props.style).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('keeps inactive content mounted but hidden with keepMounted', async () => {
    await renderWithTheme(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a"><Text>Panel A</Text></TabsContent>
        <TabsContent value="b" keepMounted><Text>Panel B</Text></TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Panel B', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('Panel B')).toBeNull();
  });

  it('throws when parts are used outside their parent', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<TabsList>{null}</TabsList>)).rejects.toThrow('TabsList must be used within Tabs');
    await expect(renderWithTheme(<TabsContent value="a">x</TabsContent>)).rejects.toThrow('TabsContent must be used within Tabs');
    await expect(
      renderWithTheme(
        <Tabs>
          <TabsTrigger value="a">A</TabsTrigger>
        </Tabs>,
      ),
    ).rejects.toThrow('TabsTrigger must be used within TabsList');
    spy.mockRestore();
  });
});
