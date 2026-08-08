import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, Plus, Minus, Bell, Sparkles } from 'lucide-react';

interface CookingTimerProps {
  instructions?: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  onTimerComplete?: (stepLabel?: string) => void;
  activePresetSeconds?: number;
  activeStepLabel?: string;
}

export interface ExtractedTimerPreset {
  stepIndex: number;
  label: string;
  minutes: number;
  seconds: number;
}

export function extractTimersFromInstructions(instructions: string[] = []): ExtractedTimerPreset[] {
  const presets: ExtractedTimerPreset[] = [];
  
  instructions.forEach((step, idx) => {
    // Regex matches e.g. "8-10 minutes", "5 minutes", "2 mins", "30 seconds", "1 hour"
    const minMatch = step.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(minute|min|m\b)/i);
    const secMatch = step.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(second|sec|s\b)/i);

    if (minMatch) {
      const minutes = parseInt(minMatch[2] || minMatch[1], 10);
      if (minutes > 0 && minutes <= 180) {
        presets.push({
          stepIndex: idx,
          label: `Step ${idx + 1} (${minutes}m)`,
          minutes,
          seconds: minutes * 60,
        });
      }
    } else if (secMatch) {
      const seconds = parseInt(secMatch[2] || secMatch[1], 10);
      if (seconds > 0) {
        presets.push({
          stepIndex: idx,
          label: `Step ${idx + 1} (${seconds}s)`,
          minutes: Math.ceil(seconds / 60),
          seconds,
        });
      }
    }
  });

  return presets;
}

export const CookingTimer: React.FC<CookingTimerProps> = ({
  instructions = [],
  prepTimeMinutes,
  cookTimeMinutes,
  activePresetSeconds,
  activeStepLabel,
}) => {
  const extractedPresets = extractTimersFromInstructions(instructions);

  const [totalSeconds, setTotalSeconds] = useState<number>(300); // Default 5 mins
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeLabel, setActiveLabel] = useState<string>('Custom Timer');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external preset if provided
  useEffect(() => {
    if (activePresetSeconds && activePresetSeconds > 0) {
      setTotalSeconds(activePresetSeconds);
      setTimeLeft(activePresetSeconds);
      setActiveLabel(activeStepLabel || 'Recipe Step Timer');
      setIsRunning(true);
      setIsFinished(false);
    }
  }, [activePresetSeconds, activeStepLabel]);

  // Handle countdown interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsFinished(true);
            playAlarmSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Web Audio API synth beep when timer hits 0
  const playAlarmSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Play 3 successive pleasant chime tones
      [0, 0.25, 0.5].forEach((delay, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(index === 1 ? 880 : index === 2 ? 1046.5 : 659.25, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch {
      // Audio context might be blocked if user has not interacted
    }
  };

  const selectPreset = (seconds: number, label: string) => {
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setActiveLabel(label);
    setIsRunning(true);
    setIsFinished(false);
  };

  const togglePlayPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setIsFinished(false);
  };

  const adjustTime = (deltaSeconds: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(0, prev + deltaSeconds);
      if (next > totalSeconds) setTotalSeconds(next);
      return next;
    });
    setIsFinished(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const getTimerStatus = (): { label: 'Ready' | 'Running' | 'Paused' | 'Finished'; color: string; bg: string; dot: string } => {
    if (isFinished || (timeLeft === 0 && totalSeconds > 0)) {
      return { label: 'Finished', color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/20 border-[#D4AF37]', dot: 'bg-[#D4AF37] animate-ping' };
    }
    if (isRunning) {
      return { label: 'Running', color: 'text-[#E5C158]', bg: 'bg-[#E5C158]/15 border-[#E5C158]/40', dot: 'bg-[#E5C158] animate-pulse' };
    }
    if (timeLeft < totalSeconds && timeLeft > 0) {
      return { label: 'Paused', color: 'text-[#E6A135]', bg: 'bg-[#E6A135]/15 border-[#E6A135]/40', dot: 'bg-[#E6A135]' };
    }
    return { label: 'Ready', color: 'text-[#A39C90]', bg: 'bg-[#23211E] border-[#2A2724]', dot: 'bg-[#A39C90]' };
  };

  const timerStatus = getTimerStatus();

  return (
    <div className="bg-[#1E1D1B] rounded-3xl border border-[#2A2724] p-5 sm:p-6 shadow-xl space-y-5 relative overflow-hidden">
      {/* Alarm flash animation overlay when finished */}
      {isFinished && (
        <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse pointer-events-none border-2 border-[#D4AF37] rounded-3xl" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-md">
            <Timer className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F5F2EB] flex items-center gap-2">
              Built-in Kitchen Timer
              {isFinished && (
                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-black text-[10px] font-extrabold uppercase animate-bounce">
                  Time&apos;s Up!
                </span>
              )}
            </h3>
            <p className="text-xs text-[#A39C90]">{activeLabel}</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-[#23211E] border-[#2A2724] text-[#D4AF37] hover:border-[#D4AF37]'
              : 'bg-[#23211E] border-[#2A2724] text-[#8A8275] hover:text-[#C2BCB2]'
          }`}
          title={soundEnabled ? 'Mute alarm chime' : 'Enable alarm chime'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Display & Progress Ring / Bar */}
      <div className="bg-[#161513] rounded-2xl border border-[#2A2724] p-5 flex flex-col items-center justify-center space-y-4 relative">
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-widest text-[#F5F2EB] font-mono">
            {formatTime(timeLeft)}
          </div>
          {/* Timer Status Badge */}
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border uppercase tracking-wider ${timerStatus.color} ${timerStatus.bg}`}>
              <span className={`w-2 h-2 rounded-full ${timerStatus.dot}`} />
              <span>Status: {timerStatus.label}</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#2A2724] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* Adjust Buttons (-1m, +1m, +5m) */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => adjustTime(-60)}
            disabled={timeLeft <= 0}
            className="px-3 py-1.5 bg-[#23211E] hover:bg-[#2A2724] disabled:opacity-40 border border-[#2A2724] rounded-xl text-xs font-bold text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer flex items-center gap-1"
          >
            <Minus className="w-3 h-3" /> 1m
          </button>
          <button
            onClick={() => adjustTime(60)}
            className="px-3 py-1.5 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] rounded-xl text-xs font-bold text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 1m
          </button>
          <button
            onClick={() => adjustTime(300)}
            className="px-3 py-1.5 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] rounded-xl text-xs font-bold text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 5m
          </button>
        </div>
      </div>

      {/* Main Play / Pause / Reset Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={togglePlayPause}
          className={`px-6 py-3 rounded-2xl font-extrabold text-sm transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
            isRunning
              ? 'bg-[#23211E] text-[#E6A135] border border-[#E6A135] hover:bg-[#E6A135]/10'
              : 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110 shadow-[#D4AF37]/15'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> {timeLeft === 0 ? 'Restart' : 'Start Timer'}
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] hover:text-[#F5F2EB] border border-[#2A2724] rounded-2xl transition-all cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Buttons derived from Recipe Steps & Common Timers */}
      <div className="space-y-2 pt-2 border-t border-[#2A2724]">
        <div className="text-[11px] font-bold text-[#A39C90] uppercase tracking-wider flex items-center justify-between">
          <span>Quick Presets</span>
          <span>Click to start immediately</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Presets extracted from steps */}
          {extractedPresets.map((preset) => (
            <button
              key={preset.stepIndex}
              onClick={() => selectPreset(preset.seconds, preset.label)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-3 h-3 text-[#D4AF37]" />
              {preset.label}
            </button>
          ))}

          {/* Overall Cook Time preset if available */}
          {cookTimeMinutes && (
            <button
              onClick={() => selectPreset(cookTimeMinutes * 60, `Total Cook (${cookTimeMinutes}m)`)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37] text-[#F5F2EB] hover:text-[#D4AF37] transition-all cursor-pointer"
            >
              Total Cook ({cookTimeMinutes}m)
            </button>
          )}

          {/* Standard duration presets */}
          {[1, 3, 5, 10, 15, 20].map((mins) => (
            <button
              key={mins}
              onClick={() => selectPreset(mins * 60, `${mins} Minute Timer`)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] transition-all cursor-pointer"
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
