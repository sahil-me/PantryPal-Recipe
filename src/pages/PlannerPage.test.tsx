import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlannerPage } from './PlannerPage';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const renderPlannerPage = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <PlannerPage />
      </AppProvider>
    </AuthProvider>
  );
};

describe('PlannerPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders weekly meal planner title and days of week', async () => {
    renderPlannerPage();

    expect(screen.getByText('My Weekly Cooking Schedule')).toBeTruthy();
    expect(screen.getByText('Monday')).toBeTruthy();
    expect(screen.getByText('Tuesday')).toBeTruthy();
    expect(screen.getByText('Wednesday')).toBeTruthy();
    expect(screen.getByText('Thursday')).toBeTruthy();
    expect(screen.getByText('Friday')).toBeTruthy();
    expect(screen.getByText('Saturday')).toBeTruthy();
    expect(screen.getByText('Sunday')).toBeTruthy();
  });

  it('prompts unauthenticated guest user with sign-up modal when clicking Create Free Account button', async () => {
    renderPlannerPage();

    const createAccountBtns = screen.getAllByText(/Create Free Account/i);
    expect(createAccountBtns.length).toBeGreaterThan(0);
    fireEvent.click(createAccountBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Create Your Free Account/i)).toBeTruthy();
      expect(screen.getByText(/Sign up for a free PantryPal account to save and sync your weekly meal plan!/i)).toBeTruthy();
    });
  });

  it('shows free membership sign-up callout banner for guest users', () => {
    renderPlannerPage();

    expect(screen.getByText('Save & Sync Your Weekly Meal Plan Free')).toBeTruthy();
    expect(screen.getByText('Create Free Account')).toBeTruthy();
  });
});
