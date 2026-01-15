/**
 * Export-key command - Export private key (dangerous!)
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { WalletManager } from '../../wallet/manager.js';
import { AuditLogger } from '../../security/audit.js';
import { formatError, formatWarning } from '../utils/formatters.js';

export async function exportKeyCommand(): Promise<void> {
  console.log('\n' + chalk.bold.red('⚠️  WARNING: PRIVATE KEY EXPORT'));
  console.log(chalk.red('This will display your private key in plaintext.'));
  console.log(chalk.red('Anyone with this key has FULL ACCESS to your wallet.'));
  console.log(chalk.red('Only proceed if you understand the risks.\n'));

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Do you want to continue?',
      default: false
    }
  ]);

  if (!confirmed) {
    console.log(formatWarning('\nExport cancelled.\n'));
    return;
  }

  const { doubleConfirm } = await inquirer.prompt([
    {
      type: 'input',
      name: 'doubleConfirm',
      message: 'Type "I UNDERSTAND THE RISKS" to proceed:',
      validate: (input: string) => {
        return input === 'I UNDERSTAND THE RISKS' || 'You must type the exact phrase';
      }
    }
  ]);

  try {
    const walletManager = new WalletManager();
    const privateKey = await walletManager.exportPrivateKey();

    // Log audit event
    await AuditLogger.logAction('wallet_exported', {
      timestamp: new Date().toISOString()
    });

    console.log('\n' + chalk.bold('🔑 Private Key:'));
    console.log(chalk.cyan(privateKey));
    console.log('\n' + chalk.red('Store this securely and never share it with anyone.'));
    console.log(chalk.red('This key will not be shown again.\n'));

  } catch (error) {
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
