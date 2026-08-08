import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingsPage } from './SettingsPage';
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

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    const mockUser = {
      id: 'usr-test-123',
      name: 'Chef Alex',
      email: 'chef.alex@pantrypal.com',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('pantrypal_user', JSON.stringify(mockUser));
  });

  it('renders account information, security placeholders, and danger zone', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Edit Name')).toBeInTheDocument();
    expect(screen.getByText('Change Email')).toBeInTheDocument();
    expect(screen.getByText('Security & Account Controls')).toBeInTheDocument();
    expect(screen.getByText('DANGER ZONE')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Chef Alex')).toBeInTheDocument();
    expect(screen.getByDisplayValue('chef.alex@pantrypal.com')).toBeInTheDocument();
  });

  it('shows save changes button only when fields are modified', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Chef Alex');
    fireEvent.click(nameInput);
    fireEvent.change(nameInput, { target: { value: 'Chef Alexander' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('validates empty name field', () => {
    renderWithProviders(<SettingsPage />);

    const nameInput = screen.getByDisplayValue('Chef Alex');
    fireEvent.click(nameInput);
    fireEvent.change(nameInput, { target: { value: '   ' } });

    expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();
  });

  it('requires typing "DELETE" to enable account deletion button', () => {
    renderWithProviders(<SettingsPage />);

    const deleteBtn = screen.getByText('Delete My Account');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    const confirmDeleteBtn = screen.getByText('Delete Everything').closest('button');
    expect(confirmDeleteBtn).toBeDisabled();

    const confirmInput = screen.getByPlaceholderText('Type "DELETE"');
    fireEvent.change(confirmInput, { target: { value: 'delete' } });
    expect(confirmDeleteBtn).toBeDisabled(); // case sensitive!

    fireEvent.change(confirmInput, { target: { value: 'DELETE' } });
    expect(confirmDeleteBtn).not.toBeDisabled();
  });
});
