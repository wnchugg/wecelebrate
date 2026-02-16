/**
 * Form Component Tests
 * 
 * Coverage:
 * - Form context
 * - Field registration
 * - Validation
 * - Error display
 * - Form submission
 * 
 * Total Tests: 10
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { renderWithRouter } from '@/test/helpers';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '../form';
import { Input } from '../input';
import { Button } from '../button';

// Test schema
const testFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

describe('Form Component', () => {
  const TestForm = ({ onSubmit }: { onSubmit: (data: TestFormValues) => void }) => {
    const form = useForm<TestFormValues>({
      // @ts-expect-error - zodResolver type compatibility issue with @hookform/resolvers v5
      resolver: zodResolver(testFormSchema),
      defaultValues: {
        username: '',
        email: '',
        age: 0,
      },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormDescription>Your unique username</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    );
  };

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      const handleSubmit = vi.fn();
      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render form labels', () => {
      const handleSubmit = vi.fn();
      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render form description', () => {
      const handleSubmit = vi.fn();
      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      expect(screen.getByText('Your unique username')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show validation error for short username', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      await user.type(usernameInput, 'ab');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid email', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      // Fill username to pass its validation
      const usernameInput = screen.getByLabelText('Username');
      await user.type(usernameInput, 'validuser');
      
      const emailInput = screen.getByLabelText('Email');
      // Use a clearly invalid email that Zod will reject
      await user.type(emailInput, 'notanemail');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Wait for form validation to complete - check for the exact error message from schema
      await waitFor(() => {
        const errorMessage = screen.queryByText('Invalid email address');
        expect(errorMessage).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should show multiple validation errors', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should clear validation errors when input is corrected', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Trigger validation error
      await user.type(usernameInput, 'ab');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });

      // Fix the error
      await user.clear(usernameInput);
      await user.type(usernameInput, 'validusername');

      await waitFor(() => {
        expect(screen.queryByText('Username must be at least 3 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');

      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          {
            username: 'testuser',
            email: 'test@example.com',
            age: 0,
          },
          expect.anything() // React event object
        );
      });
    });

    it('should not submit form with invalid data', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Field Registration', () => {
    it('should register fields with form', () => {
      const handleSubmit = vi.fn();
      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');

      expect(usernameInput).toHaveAttribute('name', 'username');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    it('should update field values', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<TestForm onSubmit={handleSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });
  });
});