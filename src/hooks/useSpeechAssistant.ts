import { useState, useEffect, useRef } from 'react';
import { ISpeechRecognitionEvent, ISpeechRecognitionErrorEvent, ISpeechRecognitionInstance } from '../types';

export interface UseSpeechAssistantOptions {
  instructions: string[];
  completedSteps?: number[];
  onToggleStep?: (index: number) => void;
}

export interface UseSpeechAssistantReturn {
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  toggleHandsFree: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isSpeaking: boolean;
  isPaused: boolean;
  autoAdvance: boolean;
  toggleAutoAdvance: () => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  isListening: boolean;
  lastCommand: string | null;
  recognitionSupported: boolean;
  micPermissionDenied: boolean;
  isSpeechSupported: boolean;
  speakStep: (stepIndex: number) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  requestMicPermissionAndStart: () => Promise<void>;
  stopVoiceRecognition: () => void;
}

export function useSpeechAssistant({
  instructions,
  completedSteps = [],
  onToggleStep,
}: UseSpeechAssistantOptions): UseSpeechAssistantReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Voice Command Recognition state
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to eliminate stale closure bugs in SpeechSynthesis event callbacks
  const autoAdvanceRef = useRef(autoAdvance);
  const isActiveRef = useRef(isActive);
  const currentStepRef = useRef(currentStep);
  const speechRateRef = useRef(speechRate);
  const completedStepsRef = useRef(completedSteps);
  const onToggleStepRef = useRef(onToggleStep);
  const instructionsRef = useRef(instructions);

  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { speechRateRef.current = speechRate; }, [speechRate]);
  useEffect(() => { completedStepsRef.current = completedSteps; }, [completedSteps]);
  useEffect(() => { onToggleStepRef.current = onToggleStep; }, [onToggleStep]);
  useEffect(() => { instructionsRef.current = instructions; }, [instructions]);

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  const isSpeechSupported = typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setRecognitionSupported(true);
      }
    }

    return () => {
      clearAdvanceTimeout();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      stopVoiceRecognition();
    };
  }, []);

  const requestMicPermissionAndStart = async () => {
    if (typeof window === 'undefined') return;
    setMicPermissionDenied(false);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicPermissionDenied(false);
      } catch (err) {
        console.warn('Microphone permission denied or unsupported:', err);
        setMicPermissionDenied(true);
        setIsListening(false);
        return;
      }
    }

    startVoiceRecognition();
  };

  const startVoiceRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript;
        processVoiceCommand(transcript);
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.warn('Voice recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionDenied(true);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isActiveRef.current && !micPermissionDenied) {
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              try {
                recognition.start();
              } catch {
                setIsListening(false);
              }
            }
          }, 300);
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start recognition:', err);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processVoiceCommand = (rawTranscript: string) => {
    const transcript = rawTranscript.toLowerCase().trim();
    setLastCommand(transcript);

    const numberWords: { [key: string]: number } = {
      one: 1, first: 1,
      two: 2, second: 2,
      three: 3, third: 3,
      four: 4, fourth: 4,
      five: 5, fifth: 5,
      six: 6, sixth: 6,
      seven: 7, seventh: 7,
      eight: 8, eighth: 8,
      nine: 9, ninth: 9,
      ten: 10, tenth: 10,
    };

    const digitMatch = transcript.match(/(?:step|go to step|number)\s*(\d+)/i);
    if (digitMatch && digitMatch[1]) {
      const targetStep = parseInt(digitMatch[1], 10) - 1;
      if (targetStep >= 0 && targetStep < instructionsRef.current.length) {
        setCurrentStep(targetStep);
        currentStepRef.current = targetStep;
        speakStep(targetStep);
        return;
      }
    }

    for (const [word, num] of Object.entries(numberWords)) {
      if (transcript.includes(`step ${word}`) || transcript.includes(`${word} step`)) {
        const targetStep = num - 1;
        if (targetStep >= 0 && targetStep < instructionsRef.current.length) {
          setCurrentStep(targetStep);
          currentStepRef.current = targetStep;
          speakStep(targetStep);
          return;
        }
      }
    }

    if (
      transcript.includes('next') ||
      transcript.includes('forward') ||
      transcript.includes('continue') ||
      transcript.includes('skip') ||
      transcript.includes('advance')
    ) {
      handleNextStep();
    } else if (
      transcript.includes('back') ||
      transcript.includes('previous') ||
      transcript.includes('prev') ||
      transcript.includes('rewind') ||
      transcript.includes('last')
    ) {
      handlePrevStep();
    } else if (
      transcript.includes('repeat') ||
      transcript.includes('again') ||
      transcript.includes('replay') ||
      transcript.includes('read') ||
      transcript.includes('say') ||
      transcript.includes('speak')
    ) {
      speakStep(currentStepRef.current);
    } else if (
      transcript.includes('pause') ||
      transcript.includes('stop') ||
      transcript.includes('wait') ||
      transcript.includes('hold')
    ) {
      pauseSpeech();
    } else if (
      transcript.includes('play') ||
      transcript.includes('resume') ||
      transcript.includes('start') ||
      transcript.includes('go') ||
      transcript.includes('begin') ||
      transcript.includes('unpause')
    ) {
      if (isPaused) {
        resumeSpeech();
      } else {
        speakStep(currentStepRef.current);
      }
    } else if (
      transcript.includes('done') ||
      transcript.includes('complete') ||
      transcript.includes('finish') ||
      transcript.includes('check')
    ) {
      if (onToggleStepRef.current && !completedStepsRef.current.includes(currentStepRef.current)) {
        onToggleStepRef.current(currentStepRef.current);
      }
    }
  };

  const speakStep = (stepIndex: number) => {
    if (!synthRef.current || !instructionsRef.current[stepIndex] || typeof SpeechSynthesisUtterance === 'undefined') return;

    clearAdvanceTimeout();

    try {
      synthRef.current.cancel();
    } catch {
      // ignore
    }

    const currentInst = instructionsRef.current;
    const textToSpeak = `Step ${stepIndex + 1} of ${currentInst.length}. ${currentInst[stepIndex]}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRateRef.current;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);

      if (onToggleStepRef.current && !completedStepsRef.current.includes(stepIndex)) {
        onToggleStepRef.current(stepIndex);
      }

      if (autoAdvanceRef.current && isActiveRef.current && stepIndex < instructionsRef.current.length - 1) {
        const nextStepIndex = stepIndex + 1;
        setCurrentStep(nextStepIndex);
        currentStepRef.current = nextStepIndex;
        advanceTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current && autoAdvanceRef.current) {
            speakStep(nextStepIndex);
          }
        }, 1200);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const pauseSpeech = () => {
    clearAdvanceTimeout();
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const resumeSpeech = () => {
    clearAdvanceTimeout();
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    } else {
      speakStep(currentStepRef.current);
    }
  };

  const handleNextStep = () => {
    clearAdvanceTimeout();
    if (currentStepRef.current < instructionsRef.current.length - 1) {
      const nextIndex = currentStepRef.current + 1;
      setCurrentStep(nextIndex);
      currentStepRef.current = nextIndex;
      if (isActiveRef.current) {
        speakStep(nextIndex);
      }
    }
  };

  const handlePrevStep = () => {
    clearAdvanceTimeout();
    if (currentStepRef.current > 0) {
      const prevIndex = currentStepRef.current - 1;
      setCurrentStep(prevIndex);
      currentStepRef.current = prevIndex;
      if (isActiveRef.current) {
        speakStep(prevIndex);
      }
    }
  };

  const toggleAutoAdvance = () => {
    const nextVal = !autoAdvance;
    setAutoAdvance(nextVal);
    autoAdvanceRef.current = nextVal;

    if (nextVal && isActiveRef.current) {
      clearAdvanceTimeout();
      if (!isSpeaking) {
        speakStep(currentStepRef.current);
      }
    } else if (!nextVal) {
      clearAdvanceTimeout();
    }
  };

  const toggleHandsFree = () => {
    if (!isActive) {
      setIsActive(true);
      isActiveRef.current = true;
      speakStep(currentStep);
      if (recognitionSupported) {
        requestMicPermissionAndStart();
      }
    } else {
      setIsActive(false);
      isActiveRef.current = false;
      clearAdvanceTimeout();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(false);
      stopVoiceRecognition();
    }
  };

  return {
    isActive,
    setIsActive,
    toggleHandsFree,
    currentStep,
    setCurrentStep,
    isSpeaking,
    isPaused,
    autoAdvance,
    toggleAutoAdvance,
    speechRate,
    setSpeechRate,
    isListening,
    lastCommand,
    recognitionSupported,
    micPermissionDenied,
    isSpeechSupported,
    speakStep,
    pauseSpeech,
    resumeSpeech,
    handleNextStep,
    handlePrevStep,
    requestMicPermissionAndStart,
    stopVoiceRecognition,
  };
}
