import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HandsFreeMode } from './HandsFreeMode';

const mockInstructions = [
  'Preheat oven to 425°F (220°C).',
  'Cut potatoes into 1-inch cubes and toss with olive oil.',
  'Roast for 30 minutes until golden and crispy.'
];

describe('HandsFreeMode Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock speechSynthesis in jsdom environment
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
      },
      writable: true,
      configurable: true,
    });
  });

  it('renders activation banner initially in inactive state', () => {
    render(<HandsFreeMode instructions={mockInstructions} recipeTitle="Crispy Roasted Potatoes" />);

    expect(screen.getByText("Chef's Voice & Hands-Free Guide")).toBeTruthy();
    expect(screen.getByText('Start Hands-Free Mode')).toBeTruthy();
  });

  it('activates hands-free mode and shows player deck when clicked', () => {
    render(<HandsFreeMode instructions={mockInstructions} recipeTitle="Crispy Roasted Potatoes" />);

    const startButton = screen.getByText('Start Hands-Free Mode');
    fireEvent.click(startButton);

    expect(screen.getByText('ACTIVE')).toBeTruthy();
    expect(screen.getByText('Exit Hands-Free Mode')).toBeTruthy();
    expect(screen.getByText('Step 1 of 3')).toBeTruthy();
    expect(screen.getByText(mockInstructions[0])).toBeTruthy();
  });

  it('navigates through steps using forward and backward buttons', () => {
    render(<HandsFreeMode instructions={mockInstructions} recipeTitle="Crispy Roasted Potatoes" />);

    const startButton = screen.getByText('Start Hands-Free Mode');
    fireEvent.click(startButton);

    const nextBtn = screen.getByTitle('Next Step');
    fireEvent.click(nextBtn);

    expect(screen.getByText('Step 2 of 3')).toBeTruthy();
    expect(screen.getByText(mockInstructions[1])).toBeTruthy();

    const prevBtn = screen.getByTitle('Previous Step');
    fireEvent.click(prevBtn);

    expect(screen.getByText('Step 1 of 3')).toBeTruthy();
    expect(screen.getByText(mockInstructions[0])).toBeTruthy();
  });

  it('handles Auto Next toggle correctly', () => {
    render(<HandsFreeMode instructions={mockInstructions} recipeTitle="Crispy Roasted Potatoes" />);

    const startButton = screen.getByText('Start Hands-Free Mode');
    fireEvent.click(startButton);

    const autoNextBtn = screen.getByTitle('Automatically speak next step when finished');
    expect(autoNextBtn).toBeTruthy();

    fireEvent.click(autoNextBtn);
    expect(screen.getByText('Auto-Next')).toBeTruthy();
  });

  it('opens and closes the Voice Commands Guide modal correctly', () => {
    render(<HandsFreeMode instructions={mockInstructions} recipeTitle="Crispy Roasted Potatoes" />);

    const voiceHelpBtn = screen.getByTitle('Voice Commands Help');
    fireEvent.click(voiceHelpBtn);

    expect(screen.getByText('Voice Commands Guide')).toBeTruthy();
    expect(screen.getByText('Control cooking steps without touching your screen')).toBeTruthy();

    const closeBtn = screen.getByText("Got it, let's cook!");
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Voice Commands Guide')).toBeNull();
  });
});
