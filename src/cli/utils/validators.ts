/**
 * Input validation utilities
 */

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePositiveNumber(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    throw new Error('Value must be a positive number');
  }
  return num;
}
