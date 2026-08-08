import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { validatePhoneWithLib } from '../utils/phoneValidation';

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
];

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  placeholder?: string;
  hasError?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  selectedCountry,
  onCountryChange,
  placeholder = '10-digit number',
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dialCode.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
      {/* Country Selector Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-3 bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl text-xs font-bold text-[#F5F2EB] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
      >
        <span className="text-sm">{selectedCountry.flag}</span>
        <span className="font-mono text-[#D4AF37]">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#A39C90] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#1A1918] border border-[#2A2724] rounded-2xl shadow-2xl z-50 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative flex items-center px-2 py-1 bg-[#161513] border border-[#2A2724] rounded-xl">
            <Search className="w-3.5 h-3.5 text-[#A39C90] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-7 pr-2 py-1 text-xs bg-transparent text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            {filteredCountries.length === 0 ? (
              <p className="text-[11px] text-[#8A8275] text-center py-3">No matching country</p>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onCountryChange(c);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2A2724] text-[#D4AF37] font-bold'
                        : 'text-[#C2BCB2] hover:bg-[#23211E] hover:text-[#F5F2EB]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span className="truncate max-w-[110px]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-[#A39C90]">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none transition-all ${
          hasError
            ? 'bg-red-950/20 border-red-500/80 focus:ring-2 focus:ring-red-500/30'
            : 'bg-[#23211E] border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
        }`}
      />
    </div>
  );
};

