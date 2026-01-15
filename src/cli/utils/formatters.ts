/**
 * Formatting utilities for CLI output
 */

import chalk from 'chalk';

export function formatCurrency(amount: number | string, currency: string = 'USDC'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)} ${currency}`;
}

export function formatAddress(address: string, truncate: boolean = true): string {
  if (!truncate) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatStatus(status: 'pending' | 'success' | 'failed'): string {
  switch (status) {
    case 'success':
      return chalk.green('✓ Success');
    case 'failed':
      return chalk.red('✗ Failed');
    case 'pending':
      return chalk.yellow('⋯ Pending');
  }
}

export function formatError(message: string): string {
  return chalk.red(`Error: ${message}`);
}

export function formatSuccess(message: string): string {
  return chalk.green(message);
}

export function formatWarning(message: string): string {
  return chalk.yellow(message);
}

export function formatInfo(message: string): string {
  return chalk.blue(message);
}
