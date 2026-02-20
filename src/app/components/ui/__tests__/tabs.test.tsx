/**
 * Tabs Component Tests
 * 
 * Coverage:
 * - Tab rendering
 * - Tab switching
 * - Default value
 * - Controlled state
 * - Accessibility
 * 
 * Total Tests: 10
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

describe('Tabs Component', () => {
  const renderTabs = (props = {}) => {
    return render(
      <Tabs {...props}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );
  };

  describe('Rendering', () => {
    it('should render all tab triggers', () => {
      renderTabs();
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      renderTabs({ defaultValue: 'tab1' });
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('should render tabs list', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should show correct content when tab is clicked', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(screen.getByText('Tab 2'));
      
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('should switch between multiple tabs', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      await user.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      await user.click(screen.getByText('Tab 3'));
      expect(screen.getByText('Content 3')).toBeInTheDocument();

      await user.click(screen.getByText('Tab 1'));
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should call onValueChange when tab changes', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      await user.click(screen.getByText('Tab 2'));
      
      expect(handleValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('tab1');

        return (
          <div>
            <Tabs value={value} onValueChange={setValue}>
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">Content 1</TabsContent>
              <TabsContent value="tab2">Content 2</TabsContent>
            </Tabs>
            <div data-testid="current-tab">{value}</div>
          </div>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      expect(screen.getByTestId('current-tab')).toHaveTextContent('tab1');

      await user.click(screen.getByText('Tab 2'));

      expect(screen.getByTestId('current-tab')).toHaveTextContent('tab2');
    });
  });

  describe('Disabled State', () => {
    it('should handle disabled tab', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const disabledTab = screen.getByText('Tab 2');
      await user.click(disabledTab);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderTabs({ defaultValue: 'tab1' });

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should mark selected tab with aria-selected', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });
  });
});