/**
 * Balance command - Check USDC balance
 */

import chalk from 'chalk';
import ora from 'ora';
import { WalletManager } from '../../wallet/manager.js';
import { BalanceChecker } from '../../wallet/balance.js';
import { ConfigManager } from '../../config/manager.js';
import { formatCurrency, formatError } from '../utils/formatters.js';

export async function balanceCommand(): Promise<void> {
  const spinner = ora('Checking balance...').start();

  try {
    // Load config
    const config = await ConfigManager.loadConfig();

    // Load wallet
    const walletManager = new WalletManager();
    await walletManager.loadFromKeychain();
    const address = walletManager.getAddress();

    // Check balance
    const balanceChecker = new BalanceChecker(config.wallet.rpcUrl, config.wallet.usdcContract);
    const balance = await balanceChecker.getBalance(address);

    spinner.stop();

    // Display balance
    console.log('\n' + chalk.bold('💰 Balance'));
    console.log(`  ${chalk.green(formatCurrency(balance.balance, balance.symbol))}`);
    console.log(`  ${chalk.gray('on ' + config.wallet.network)}\n`);

  } catch (error) {
    spinner.fail('Failed to check balance');
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
