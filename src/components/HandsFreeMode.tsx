import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, RotateCcw, Mic, MicOff, Sparkles, Check, Radio, HelpCircle, X, Info, Command, MessageSquare } from 'lucide-react';
import { useSpeechAssistant } from '../hooks/useSpeechAssistant';

interface HandsFreeModeProps {
  instructions: string[];
  recipeTitle?: string;
  completedSteps?: number[];
  onToggleStep?: (index: number) => void;
  className?: string;
}

export const HandsFreeMode: React.FC<HandsFreeModeProps> = ({
  instructions,
  recipeTitle = 'Recipe',
  completedSteps = [],
  onToggleStep,
  className = ''
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHelpOpen) {
        setIsHelpOpen(false);
      }
    };
    if (isHelpOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHelpOpen]);

  const {
    isActive,
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
  } = useSpeechAssistant({
    instructions,
    completedSteps,
    onToggleStep,
  });

  if (!isSpeechSupported) {
    return (
      <div className={`p-3 bg-[#1A1918] border border-[#2A2724] rounded-2xl text-xs text-[#A39C90] flex items-center gap-2 ${className}`}>
        <VolumeX className="w-4 h-4 text-[#E6A135]" />
        <span>Text-to-Speech is not supported in this browser environment.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Activation Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isActive
            ? 'bg-gradient-to-r from-[#1E1D1B] via-[#23211E] to-[#1E1D1B] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10'
            : 'bg-[#1A1918] border-[#2A2724] hover:border-[#D4AF37]/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#23211E] text-[#D4AF37] border border-[#D4AF37]/30'
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-5 h-5 animate-pulse text-black" />
              ) : isActive ? (
                <Radio className="w-5 h-5 text-black animate-pulse" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB] flex items-center gap-1.5">
                  Chef's Voice & Hands-Free Guide
                </h4>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#C2BCB2] mt-0.5">
                {isActive
                  ? 'Listen to audio guidance or speak voice commands to navigate step-by-step.'
                  : 'Activate audio narration and voice controls while cooking in the kitchen.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] text-[#A39C90] hover:text-[#D4AF37] border border-[#2A2724] hover:border-[#D4AF37]/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              title="Voice Commands Help"
            >
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden md:inline">Voice Commands</span>
            </button>

            <button
              onClick={toggleHandsFree}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                isActive
                  ? 'bg-[#23211E] text-[#E6A135] border border-[#E6A135]/50 hover:bg-[#E6A135]/10'
                  : 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110'
              }`}
            >
              {isActive ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Exit Hands-Free Mode</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Hands-Free Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Player Deck */}
        {isActive && (
          <div className="mt-4 pt-4 border-t border-[#2A2724] space-y-4 animate-in fade-in duration-200">
            {/* Step Audio Progress Display */}
            <div className="bg-[#121212] rounded-xl p-4 border border-[#2A2724] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A39C90]">
                <span className="font-bold text-[#D4AF37] tracking-wider uppercase text-[10px]">
                  Step {currentStep + 1} of {instructions.length}
                </span>
                <span className="font-medium text-[11px] text-[#A39C90]">
                  {completedSteps.includes(currentStep) ? (
                    <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Completed
                    </span>
                  ) : (
                    'In Progress'
                  )}
                </span>
              </div>

              <p className="text-sm font-medium text-[#F5F2EB] leading-relaxed">
                {instructions[currentStep] || 'No instruction found.'}
              </p>

              {/* Step Progress Dots Bar */}
              <div className="flex items-center gap-1.5 pt-2">
                {instructions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentStep(idx);
                      speakStep(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer flex-1 ${
                      idx === currentStep
                        ? 'bg-[#D4AF37] shadow-sm shadow-[#D4AF37]'
                        : completedSteps.includes(idx)
                        ? 'bg-[#D4AF37]/50'
                        : 'bg-[#2A2724]'
                    }`}
                    title={`Jump to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls and Voice Mic Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Primary Audio Transport Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] disabled:opacity-40 text-[#F5F2EB] border border-[#2A2724] transition-all cursor-pointer"
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {isSpeaking ? (
                  <button
                    onClick={pauseSpeech}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Pause className="w-4 h-4 fill-black" />
                    <span>Pause</span>
                  </button>
                ) : isPaused ? (
                  <button
                    onClick={resumeSpeech}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakStep(currentStep)}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay Step</span>
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={currentStep === instructions.length - 1}
                  className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] disabled:opacity-40 text-[#F5F2EB] border border-[#2A2724] transition-all cursor-pointer"
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed & Auto Next Settings */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#121212] px-3 py-1.5 rounded-xl border border-[#2A2724]">
                  <span className="text-[11px] text-[#A39C90] font-medium">Speed:</span>
                  {[0.8, 1.0, 1.25].map(rate => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                        speechRate === rate
                          ? 'bg-[#D4AF37] text-black'
                          : 'text-[#A39C90] hover:text-[#F5F2EB]'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleAutoAdvance}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    autoAdvance
                      ? 'bg-[#23211E] text-[#D4AF37] border-[#D4AF37]/50'
                      : 'bg-[#121212] text-[#A39C90] border-[#2A2724]'
                  }`}
                  title="Automatically speak next step when finished"
                >
                  <span className={`w-2 h-2 rounded-full ${autoAdvance ? 'bg-[#D4AF37]' : 'bg-[#A39C90]'}`} />
                  <span>Auto-Next</span>
                </button>
              </div>
            </div>

            {/* Voice Command Microphone Feedback Bar */}
            {recognitionSupported && (
              <div
                className={`p-3 bg-[#121212] rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 text-xs ${
                  isListening
                    ? 'border-[#D4AF37]/60 shadow-lg shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]/30'
                    : 'border-[#2A2724]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37] shadow-xs shadow-[#D4AF37]/40 ring-2 ring-[#D4AF37]/30 animate-pulse'
                        : micPermissionDenied
                        ? 'bg-[#23211E] text-[#E6A135]'
                        : 'bg-[#23211E] text-[#A39C90]'
                    }`}
                  >
                    {isListening ? (
                      <Mic className="w-4 h-4 animate-pulse text-[#D4AF37]" />
                    ) : (
                      <MicOff className="w-4 h-4 text-[#E6A135]" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-[#F5F2EB] flex items-center gap-2">
                      {isListening
                        ? 'Listening for Voice Commands...'
                        : micPermissionDenied
                        ? 'Microphone Permission Blocked'
                        : 'Voice Commands Standby'}
                      {isListening && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#D4AF37] text-black animate-pulse">
                          LIVE
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#A39C90]">
                      {lastCommand ? (
                        <>Heard: <strong className="text-[#D4AF37]">"{lastCommand}"</strong></>
                      ) : isListening ? (
                        'Say "Play", "Next", "Back", "Repeat", "Pause", or "Step 2"'
                      ) : (
                        'Click Mic to enable hands-free voice control'
                      )}
                    </span>
                  </div>
                </div>

                {!isListening && (
                  <button
                    onClick={requestMicPermissionAndStart}
                    className="px-3 py-1.5 bg-[#23211E] hover:bg-[#2A2724] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Enable Mic</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Commands Cheat Sheet Modal */}
      {isHelpOpen && (
        <div
          onClick={() => setIsHelpOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] bg-[#1A1918] rounded-[28px] shadow-2xl border border-[#2A2724] overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
          >
            {/* Header - Fixed at top */}
            <div className="p-5 bg-[#1E1D1B] border-b border-[#2A2724] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center font-bold">
                  <Command className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#F5F2EB]">Voice Commands Guide</h3>
                  <p className="text-xs text-[#C2BCB2]">Control cooking steps without touching your screen</p>
                </div>
              </div>
              <button
                id="close-voice-commands-modal-btn"
                aria-label="Close Voice Commands Guide"
                onClick={() => setIsHelpOpen(false)}
                className="p-2 rounded-xl text-[#A39C90] hover:text-[#F5F2EB] hover:bg-[#23211E] transition-colors cursor-pointer border border-[#2A2724] hover:border-[#D4AF37]/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-2.5">
                {[
                  { cmd: '"Play" / "Resume" / "Go"', desc: 'Starts or resumes instruction speech playback' },
                  { cmd: '"Next" / "Forward" / "Skip"', desc: 'Advances to the next cooking instruction' },
                  { cmd: '"Back" / "Previous" / "Rewind"', desc: 'Returns to the previous instruction step' },
                  { cmd: '"Repeat" / "Replay" / "Read"', desc: 'Replays the current instruction step clearly' },
                  { cmd: '"Pause" / "Stop" / "Wait"', desc: 'Pauses step audio narration temporarily' },
                  { cmd: '"Step 1" / "Step 2" ...', desc: 'Jumps directly to a specific step number' },
                  { cmd: '"Done" / "Complete"', desc: 'Marks current step as completed' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#D4AF37] bg-[#121212] px-2.5 py-1 rounded-lg border border-[#2A2724] shrink-0">
                      {item.cmd}
                    </span>
                    <span className="text-[#C2BCB2] text-right font-medium">{item.desc}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#1E1D1B] border border-[#D4AF37]/30 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                  <Info className="w-4 h-4 text-[#D4AF37]" />
                  <span>Kitchen Tip</span>
                </div>
                <p className="text-[11px] text-[#A39C90] leading-relaxed">
                  Ensure your device microphone has browser permission. Speech recognition works best when background fan or water noise is minimized.
                </p>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-4 bg-[#1E1D1B] border-t border-[#2A2724] shrink-0">
              <button
                id="done-voice-commands-modal-btn"
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer hover:brightness-110 shadow-lg shadow-[#D4AF37]/15"
              >
                Got it, let's cook!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
