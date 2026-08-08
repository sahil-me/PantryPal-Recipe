import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignUpPage } from './SignUpPage';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
      user: {
        uid: 'test-user-id',
        email: 'gordon@kitchen.com',
        displayName: 'Gordon Ramsay',
        emailVerified: false,
        reload: vi.fn().mockResolvedValue(undefined),
        providerData: [],
      },
    }),
    sendEmailVerification: vi.fn().mockResolvedValue(undefined),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

const renderSignUp = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <SignUpPage />
      </AppProvider>
    </AuthProvider>
  );
};

describe('SignUpPage Component - Live Password Strength & Modern 2-Step Auth Flow', () => {
  it('renders all required registration fields, terms checkbox, and password rules', () => {
    renderSignUp();

    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Alex')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rivera')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('chef@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a strong password')).toBeInTheDocument();
    expect(screen.getByText(/I agree to PantryPal's/i)).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
  });

  it('keeps submit button disabled until all 5 password rules and terms checkbox pass', () => {
    renderSignUp();

    const submitBtn = screen.getByRole('button', { name: /Create Free Account/i });
    expect(submitBtn).toBeDisabled();

    // Fill names and email
    fireEvent.change(screen.getByPlaceholderText('Alex'), { target: { value: 'Gordon' } });
    fireEvent.change(screen.getByPlaceholderText('Rivera'), { target: { value: 'Ramsay' } });
    fireEvent.change(screen.getByPlaceholderText('chef@example.com'), { target: { value: 'gordon@kitchen.com' } });

    // Fill weak password (missing special char and uppercase)
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'pass1234' } });

    // Check terms
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    // Still disabled because password doesn't satisfy all 5 strength rules
    expect(submitBtn).toBeDisabled();

    // Fill valid strong password satisfying all 5 criteria (8+ chars, upper, lower, number, special)
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'Pass1234!' } });

    // Now enabled!
    expect(submitBtn).not.toBeDisabled();
  });

  it('displays warning when entering invalid phone number format', () => {
    renderSignUp();

    const phoneInput = screen.getByPlaceholderText('10-digit number');
    fireEvent.change(phoneInput, { target: { value: '987xyz1234' } });

    expect(screen.getByText(/Only numerical digits are allowed/i)).toBeInTheDocument();
  });

  it('navigates to Step 2 (Verification email sent) when all fields pass', async () => {
    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText('Alex'), { target: { value: 'Gordon' } });
    fireEvent.change(screen.getByPlaceholderText('Rivera'), { target: { value: 'Ramsay' } });
    fireEvent.change(screen.getByPlaceholderText('chef@example.com'), { target: { value: 'gordon@kitchen.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'ChefSecret123!' } });

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    const submitBtn = screen.getByRole('button', { name: /Create Free Account/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // Step 2 Verification Email Sent screen should appear
    expect(await screen.findByText(/Verification email sent successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/gordon@kitchen.com/i)).toBeInTheDocument();
  });
});
