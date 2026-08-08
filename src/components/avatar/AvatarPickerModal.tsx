import React, { useState } from 'react';
import { UserProfile } from '../../context/AuthContext';
import { AvatarGrid } from './AvatarGrid';
import { Avatar } from './Avatar';
import { getAvatarDefinition } from '../../data/avatars';
import { X, Sparkles, Check, RotateCcw } from 'lucide-react';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSaveAvatar: (avatarId: string) => Promise<void>;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveAvatar,
}) => {
  const currentAvatarId = user?.avatarId || user?.photoURL || user?.avatarUrl || 'initial';
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(currentAvatarId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if modal reopens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedAvatarId(user?.avatarId || user?.photoURL || user?.avatarUrl || 'initial');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const selectedDef = getAvatarDefinition(selectedAvatarId);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSaveAvatar(selectedAvatarId);
      onClose();
    } catch (err) {
      console.error('[AvatarPickerModal] Save failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#1A1918] border border-[#2A2724] rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2A2724] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#F5F2EB]">Choose Your Avatar</h2>
              <p className="text-xs text-[#A39C90]">Select a built-in culinary persona to represent your profile.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1E1D1B] hover:bg-[#23211E] text-[#A39C90] hover:text-[#F5F2EB] border border-[#2A2724] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin">
          {/* Active Avatar Live Preview Banner */}
          <div className="p-4 bg-[#1E1D1B] border border-[#D4AF37]/40 rounded-2xl flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar user={user} avatarId={selectedAvatarId} size="xl" className="shadow-lg shrink-0" />
              <div className="min-w-0 space-y-0.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">Active Selection</div>
                <div className="text-base font-bold text-[#F5F2EB] truncate">{selectedDef.name}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Currently Selected</span>
                </div>
              </div>
            </div>

            {selectedAvatarId !== 'initial' && (
              <button
                type="button"
                onClick={() => setSelectedAvatarId('initial')}
                className="px-3 py-2 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] hover:text-[#D4AF37] border border-[#2A2724] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Reset to default avatar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Use Default Avatar</span>
              </button>
            )}
          </div>

          {/* Avatar Grid Selection */}
          <AvatarGrid selectedAvatarId={selectedAvatarId} onSelectAvatar={setSelectedAvatarId} user={user} />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-[#2A2724] bg-[#161513] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#1E1D1B] hover:bg-[#23211E] text-[#F5F2EB] border border-[#2A2724] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedAvatarId === currentAvatarId || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black text-xs font-extrabold rounded-xl hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 shadow-none"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Saving Avatar...' : 'Save Avatar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
