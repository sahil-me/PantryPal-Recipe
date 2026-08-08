import { parsePhoneNumberFromString, CountryCode as LibCountryCode } from 'libphonenumber-js';
import { CountryCode } from '../components/PhoneInput';

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validates a telephone number using libphonenumber-js.
 * - If phone is empty, returns valid (as contact number is optional).
 * - Validates format, length, and digit correctness according to selected country rules.
 */
export function validatePhoneWithLib(phone: string, country: CountryCode): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: true };
  }

  const rawDigits = phone.trim();

  // Basic check: non-numeric characters except +, -, (, ), space
  if (/[^\d\s\+\-\(\)]/.test(rawDigits)) {
    return {
      isValid: false,
      error: 'Only numerical digits are allowed (no letters or special symbols)'
    };
  }

  try {
    const fullNumber = rawDigits.startsWith('+') ? rawDigits : `${country.dialCode}${rawDigits}`;
    const parsed = parsePhoneNumberFromString(fullNumber, country.code as LibCountryCode);

    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        formatted: parsed.formatInternational()
      };
    } else {
      return {
        isValid: false,
        error: `Please enter a valid phone number for ${country.name} (${country.dialCode})`
      };
    }
  } catch {
    return {
      isValid: false,
      error: `Invalid phone format for ${country.name}`
    };
  }
}
