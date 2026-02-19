import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddressInput } from '../address-input';
import { describe, it, expect, vi } from 'vitest';

describe('AddressInput - Validation Integration', () => {
  it('should validate postal code on blur for US addresses', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const postalCodeInput = screen.getByPlaceholderText('10001');
    
    // Enter invalid postal code
    fireEvent.change(postalCodeInput, { target: { value: 'INVALID' } });
    fireEvent.blur(postalCodeInput);

    await waitFor(() => {
      expect(screen.getByText(/ZIP code must be 5 digits/i)).toBeInTheDocument();
    });
  });

  it('should validate postal code on blur for Canadian addresses', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="CA"
        onChange={onChange}
      />
    );

    const postalCodeInput = screen.getByPlaceholderText('M5H 2N2');
    
    // Enter invalid postal code
    fireEvent.change(postalCodeInput, { target: { value: '12345' } });
    fireEvent.blur(postalCodeInput);

    await waitFor(() => {
      expect(screen.getByText(/Postal code must be in format A1A 1A1/i)).toBeInTheDocument();
    });
  });

  it('should accept valid US postal code', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const postalCodeInput = screen.getByPlaceholderText('10001');
    
    // Enter valid postal code
    fireEvent.change(postalCodeInput, { target: { value: '12345' } });
    fireEvent.blur(postalCodeInput);

    await waitFor(() => {
      expect(screen.queryByText(/ZIP code must be/i)).not.toBeInTheDocument();
    });
  });

  it('should validate address line for PO Box in US', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const addressInput = screen.getByPlaceholderText('123 Main Street');
    
    // Enter PO Box address
    fireEvent.change(addressInput, { target: { value: 'PO Box 123' } });
    fireEvent.blur(addressInput);

    await waitFor(() => {
      expect(screen.getByText(/PO Boxes not allowed/i)).toBeInTheDocument();
    });
  });

  it('should validate address line for minimum length', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const addressInput = screen.getByPlaceholderText('123 Main Street');
    
    // Enter too short address
    fireEvent.change(addressInput, { target: { value: 'AB' } });
    fireEvent.blur(addressInput);

    await waitFor(() => {
      expect(screen.getByText(/Address too short/i)).toBeInTheDocument();
    });
  });

  it('should accept valid address line', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const addressInput = screen.getByPlaceholderText('123 Main Street');
    
    // Enter valid address
    fireEvent.change(addressInput, { target: { value: '123 Main Street' } });
    fireEvent.blur(addressInput);

    await waitFor(() => {
      expect(screen.queryByText(/Address too short/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/PO Boxes not allowed/i)).not.toBeInTheDocument();
    });
  });

  it('should clear validation error when user starts typing', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const postalCodeInput = screen.getByPlaceholderText('10001');
    
    // Enter invalid postal code
    fireEvent.change(postalCodeInput, { target: { value: 'INVALID' } });
    fireEvent.blur(postalCodeInput);

    await waitFor(() => {
      expect(screen.getByText(/ZIP code must be/i)).toBeInTheDocument();
    });

    // Start typing again
    fireEvent.change(postalCodeInput, { target: { value: '12345' } });

    await waitFor(() => {
      expect(screen.queryByText(/ZIP code must be/i)).not.toBeInTheDocument();
    });
  });

  it('should validate address line 2 (optional field)', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const addressLine2Input = screen.getByPlaceholderText('Apt 4B');
    
    // Enter too short address in line2
    fireEvent.change(addressLine2Input, { target: { value: 'A' } });
    fireEvent.blur(addressLine2Input);

    await waitFor(() => {
      expect(screen.getByText(/Address too short/i)).toBeInTheDocument();
    });
  });

  it('should not validate empty optional fields', async () => {
    const onChange = vi.fn();
    
    render(
      <AddressInput
        defaultCountry="US"
        onChange={onChange}
      />
    );

    const addressLine2Input = screen.getByPlaceholderText('Apt 4B');
    
    // Leave optional field empty and blur
    fireEvent.blur(addressLine2Input);

    await waitFor(() => {
      expect(screen.queryByText(/Address too short/i)).not.toBeInTheDocument();
    });
  });
});
