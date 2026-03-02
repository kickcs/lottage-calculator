import {
  MAX_ACCOUNT_SIZE,
  MAX_RISK_PERCENTAGE,
  WARNING_RISK_PERCENTAGE,
  MAX_STOP_LOSS_POINTS,
} from '@/constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface LotCalculationInput {
  accountSize: string;
  riskPercentage: string;
  stopLossPoints: string;
  takeProfitPoints?: string;
}

function validateNumber(
  value: string,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {}
): string | null {
  const { min = 0, max, required = true } = options;

  if (!value || value.trim() === '') {
    return required ? `${fieldName} is required` : null;
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num <= min) {
    return `${fieldName} must be greater than ${min}`;
  }
  if (max !== undefined && num > max) {
    return `${fieldName} exceeds maximum allowed value`;
  }

  return null;
}

export function validateLotCalculation(input: LotCalculationInput): ValidationResult {
  const errors: string[] = [];

  // Validate account size
  const accountSizeError = validateNumber(input.accountSize, 'Account size', {
    max: MAX_ACCOUNT_SIZE,
  });
  if (accountSizeError) errors.push(accountSizeError);

  // Validate risk percentage
  const riskError = validateNumber(input.riskPercentage, 'Risk percentage', {
    max: MAX_RISK_PERCENTAGE,
  });
  if (riskError) {
    errors.push(riskError);
  } else {
    const riskPercentage = parseFloat(input.riskPercentage);
    if (!isNaN(riskPercentage) && riskPercentage > WARNING_RISK_PERCENTAGE) {
      errors.push(`Warning: Risk over ${WARNING_RISK_PERCENTAGE}% is not recommended`);
    }
  }

  // Validate stop loss
  const stopLossError = validateNumber(input.stopLossPoints, 'Stop loss', {
    max: MAX_STOP_LOSS_POINTS,
  });
  if (stopLossError) errors.push(stopLossError);

  // Validate take profit (optional)
  if (input.takeProfitPoints && input.takeProfitPoints.trim() !== '') {
    const takeProfitError = validateNumber(input.takeProfitPoints, 'Take profit', {
      required: false,
      max: MAX_STOP_LOSS_POINTS,
    });
    if (takeProfitError) errors.push(takeProfitError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAssetSelection(selectedAssets: string[], maxAssets: number = 10): ValidationResult {
  const errors: string[] = [];

  if (selectedAssets.length === 0) {
    errors.push('Please select at least one asset to calculate lot sizes');
  }

  if (selectedAssets.length > maxAssets) {
    errors.push(`Maximum ${maxAssets} assets can be selected`);
  }

  // Check for duplicate assets
  const uniqueAssets = new Set(selectedAssets);
  if (uniqueAssets.size !== selectedAssets.length) {
    errors.push('Duplicate assets detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeInput(value: string): string {
  // Convert comma to dot for locales where keyboard shows comma
  return value.trim().replace(/,/g, '.').replace(/[^0-9.-]/g, '');
}

export function formatInput(value: string, allowNegative: boolean = false): string {
  const sanitized = sanitizeInput(value);

  if (!allowNegative && sanitized.startsWith('-')) {
    return sanitized.substring(1);
  }

  // Prevent multiple decimal points
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  return sanitized;
}