import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechAssistant } from './useSpeechAssistant';

describe('useSpeechAssistant custom hook', () => {
  const sampleInstructions = [
    'Boil salted water in a pot.',
    'Add pasta and cook for 10 minutes.',
    'Drain pasta and toss with sauce.'
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default speech state', () => {
    const { result } = renderHook(() =>
      useSpeechAssistant({ instructions: sampleInstructions })
    );

    expect(result.current.isActive).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.autoAdvance).toBe(true);
    expect(result.current.speechRate).toBe(1.0);
  });

  it('allows step navigation forward and backward', () => {
    const { result } = renderHook(() =>
      useSpeechAssistant({ instructions: sampleInstructions })
    );

    act(() => {
      result.current.handleNextStep();
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.handleNextStep();
    });
    expect(result.current.currentStep).toBe(2);

    // Boundary check: cannot go beyond last instruction
    act(() => {
      result.current.handleNextStep();
    });
    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.handlePrevStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('toggles auto-advance option correctly', () => {
    const { result } = renderHook(() =>
      useSpeechAssistant({ instructions: sampleInstructions })
    );

    expect(result.current.autoAdvance).toBe(true);

    act(() => {
      result.current.toggleAutoAdvance();
    });
    expect(result.current.autoAdvance).toBe(false);
  });
});
