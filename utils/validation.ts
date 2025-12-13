export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateLotCalculation(input: {
  accountSize: string;
  riskPercentage: string;
  stopLossPoints: string;
  takeProfitPoints?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate account size
  if (!input.accountSize || input.accountSize.trim() === '') {
    errors.push('Account size is required');
  } else {
    const accountSize = parseFloat(input.accountSize);
    if (isNaN(accountSize)) {
      errors.push('Account size must be a valid number');
    } else if (accountSize <= 0) {
      errors.push('Account size must be greater than 0');
    } else if (accountSize > 1000000000) {
      errors.push('Account size seems unreasonably large');
    }
  }

  // Validate risk percentage
  if (!input.riskPercentage || input.riskPercentage.trim() === '') {
    errors.push('Risk percentage is required');
  } else {
    const riskPercentage = parseFloat(input.riskPercentage);
    if (isNaN(riskPercentage)) {
      errors.push('Risk percentage must be a valid number');
    } else if (riskPercentage <= 0) {
      errors.push('Risk percentage must be greater than 0');
    } else if (riskPercentage > 100) {
      errors.push('Risk percentage cannot exceed 100%');
    } else if (riskPercentage > 10) {
      errors.push('Warning: Risk percentage over 10% is generally not recommended');
    }
  }

  // Validate stop loss points
  if (!input.stopLossPoints || input.stopLossPoints.trim() === '') {
    errors.push('Stop loss is required');
  } else {
    const stopLossPoints = parseFloat(input.stopLossPoints);
    if (isNaN(stopLossPoints)) {
      errors.push('Stop loss must be a valid number');
    } else if (stopLossPoints <= 0) {
      errors.push('Stop loss must be greater than 0');
    } else if (stopLossPoints > 1000) {
      errors.push('Stop loss seems unreasonably large');
    }
  }

  // Validate take profit points (optional)
  if (input.takeProfitPoints && input.takeProfitPoints.trim() !== '') {
    const takeProfitPoints = parseFloat(input.takeProfitPoints);
    if (isNaN(takeProfitPoints)) {
      errors.push('Take profit must be a valid number');
    } else if (takeProfitPoints <= 0) {
      errors.push('Take profit must be greater than 0');
    } else if (takeProfitPoints > 1000) {
      errors.push('Take profit seems unreasonably large');
    }

    // Validate RR ratio if both SL and TP are provided
    const stopLossPoints = parseFloat(input.stopLossPoints);
    if (takeProfitPoints && stopLossPoints && takeProfitPoints <= stopLossPoints) {
      errors.push('Take profit should be larger than stop loss for positive RR ratio');
    }
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
  return value.trim().replace(/[^0-9.-]/g, '');
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