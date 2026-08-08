import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SignInPage } from './SignInPage';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const renderSignIn = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <SignInPage />
      </AppProvider>
    </AuthProvider>
  );
};

describe('SignInPage Component - Modern Authentication Flow', () => {
  it('renders sign-in header, google button, email & password fields', () => {
    renderSignIn();

    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('chef@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In with Email/i })).toBeInTheDocument();
  });

  it('toggles password visibility when clicking eye icon', () => {
    renderSignIn();

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByTitle('Show password');
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByTitle('Hide password');
    fireEvent.click(hideBtn);

    expect(passwordInput.type).toBe('password');
  });

  it('keeps submit button disabled until valid email and password are provided', () => {
    renderSignIn();

    const submitBtn = screen.getByRole('button', { name: /Sign In with Email/i });
    expect(submitBtn).toBeDisabled();

    const emailInput = screen.getByPlaceholderText('chef@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'chef@example.com' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(passwordInput, { target: { value: 'secretpass' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('shows inline validation error on invalid email on blur', () => {
    renderSignIn();

    const emailInput = screen.getByPlaceholderText('chef@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('renders link to sign up page', () => {
    renderSignIn();

    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create one for free/i })).toBeInTheDocument();
  });
});

