/**
 * Init command - Initialize CLAWD Wallet
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { WalletManager } from '../../wallet/manager.js';
import { ConfigManager } from '../../config/manager.js';
import { AuditLogger } from '../../security/audit.js';
import { Keychain } from '../../wallet/keychain.js';
import { formatSuccess, formatError, formatInfo } from '../utils/formatters.js';

export async function initCommand(): Promise<void> {
  console.log(chalk.bold('\n🦁 Initializing CLAWD Wallet...\n'));

  // Check if wallet already exists
  const hasWallet = await Keychain.hasPrivateKey();
  if (hasWallet) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'A wallet already exists. Overwrite it? (THIS WILL DELETE YOUR CURRENT WALLET)',
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(formatInfo('\nKeeping existing wallet.'));
      return;
    }
  }

  const spinner = ora('Generating new wallet...').start();

  try {
    // Generate wallet
    const walletManager = new WalletManager();
    const wallet = walletManager.generateWallet();

    // Save to keychain
    await walletManager.saveToKeychain();
    spinner.succeed('Generated new wallet');

    // Initialize config
    const configSpinner = ora('Creating configuration...').start();
    await ConfigManager.initializeConfig(wallet.address);
    configSpinner.succeed('Configuration created');

    // Log audit event
    await AuditLogger.logAction('wallet_created', {
      address: wallet.address
    });

    // Display wallet info
    console.log('\n' + chalk.green('✓ Wallet created successfully!\n'));
    console.log(chalk.bold('📍 Your wallet address:'));
    console.log(chalk.cyan(wallet.address));
    console.log('\n' + chalk.bold('💰 To fund your wallet:'));
    console.log('Send USDC on Base network to the address above');
    console.log('\n' + chalk.gray('Network: Base Mainnet'));
    console.log(chalk.gray('Token: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)'));

    // Ask about Claude Code integration
    const { setupMCP } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupMCP',
        message: '\nConfigure Claude Code integration?',
        default: true
      }
    ]);

    if (setupMCP) {
      console.log('\n' + formatInfo('Run: clawd install'));
    }

    console.log('\n' + formatSuccess('🚀 Ready to go! Try: clawd status\n'));

  } catch (error) {
    spinner.fail('Failed to initialize wallet');
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
