import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordRules {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordRules(password: string): PasswordRules {
  return {
    hasMinLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordFullyValid(password: string): boolean {
  const rules = evaluatePasswordRules(password);
  return rules.hasMinLength && rules.hasUpper && rules.hasLower && rules.hasNumber && rules.hasSpecial;
}

export function getPasswordStrengthLevel(rules: PasswordRules): {
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  score: number; // 1 to 4
  colorClass: string;
  bgClass: string;
} {
  const count = [rules.hasMinLength, rules.hasUpper, rules.hasLower, rules.hasNumber, rules.hasSpecial].filter(Boolean).length;

  if (count <= 2) {
    return { label: 'Weak', score: 1, colorClass: 'text-red-400', bgClass: 'bg-red-500' };
  } else if (count === 3) {
    return { label: 'Fair', score: 2, colorClass: 'text-amber-400', bgClass: 'bg-amber-500' };
  } else if (count === 4) {
    return { label: 'Good', score: 3, colorClass: 'text-[#D4AF37]', bgClass: 'bg-[#D4AF37]' };
  } else {
    return { label: 'Strong', score: 4, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500' };
  }
}

interface Props {
  password: string;
}

export const PasswordStrengthChecker: React.FC<Props> = ({ password }) => {
  if (!password) return null;

  const rules = evaluatePasswordRules(password);
  const strength = getPasswordStrengthLevel(rules);

  const checklistItems = [
    { key: 'length', label: 'At least 8 characters', satisfied: rules.hasMinLength },
    { key: 'upper', label: 'Uppercase letter (A-Z)', satisfied: rules.hasUpper },
    { key: 'lower', label: 'Lowercase letter (a-z)', satisfied: rules.hasLower },
    { key: 'number', label: 'Number (0-9)', satisfied: rules.hasNumber },
    { key: 'special', label: 'Special character (!@#$%^&*)', satisfied: rules.hasSpecial },
  ];

  return (
    <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
      {/* Strength Indicator Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[#A39C90]">Password Strength:</span>
          <span className={`${strength.colorClass} uppercase tracking-wider`}>{strength.label}</span>
        </div>
        <div className="h-1.5 w-full bg-[#161513] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[#2A2724]">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                step <= strength.score ? strength.bgClass : 'bg-[#2A2724]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Live Requirement Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
        {checklistItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
              item.satisfied ? 'text-emerald-400' : 'text-[#8A8275]'
            }`}
          >
            {item.satisfied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-400/70 shrink-0 stroke-[2.5]" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
