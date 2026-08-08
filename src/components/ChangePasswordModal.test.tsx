import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <AppProvider>
        {ui}
      </AppProvider>
    </AuthProvider>
  );
};

describe('ChangePasswordModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    renderWithProviders(<ChangePasswordModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimum 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Password/i })).toBeDisabled();
  });

  it('validates password fields and enables submit when valid', async () => {
    renderWithProviders(<ChangePasswordModal {...defaultProps} />);

    const currentInput = screen.getByPlaceholderText('Enter current password');
    const newInput = screen.getByPlaceholderText('Minimum 8 characters');
    const confirmInput = screen.getByPlaceholderText('Re-enter new password');

    fireEvent.change(currentInput, { target: { value: 'OldPass123!' } });
    fireEvent.change(newInput, { target: { value: 'NewPass123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPass123!' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update Password/i })).not.toBeDisabled();
    });
  });

  it('shows error if new password is too short', async () => {
    renderWithProviders(<ChangePasswordModal {...defaultProps} />);

    const newInput = screen.getByPlaceholderText('Minimum 8 characters');
    fireEvent.change(newInput, { target: { value: 'short' } });
    fireEvent.blur(newInput);

    await waitFor(() => {
      expect(screen.getByText('New password must be at least 8 characters long.')).toBeInTheDocument();
    });
  });

  it('shows error if confirm password does not match', async () => {
    renderWithProviders(<ChangePasswordModal {...defaultProps} />);

    const newInput = screen.getByPlaceholderText('Minimum 8 characters');
    const confirmInput = screen.getByPlaceholderText('Re-enter new password');

    fireEvent.change(newInput, { target: { value: 'NewPass123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123!' } });
    fireEvent.blur(confirmInput);

    await waitFor(() => {
      expect(screen.getByText('Confirm password must match new password.')).toBeInTheDocument();
    });
  });
});
