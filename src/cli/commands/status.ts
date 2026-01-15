/**
 * Status command - Show wallet status
 */

import chalk from 'chalk';
import ora from 'ora';
import { WalletManager } from '../../wallet/manager.js';
import { BalanceChecker } from '../../wallet/balance.js';
import { ConfigManager } from '../../config/manager.js';
import { TransactionHistory } from '../../wallet/history.js';
import { formatCurrency, formatAddress, formatError, formatTimestamp, formatStatus } from '../utils/formatters.js';

export async function statusCommand(): Promise<void> {
  const spinner = ora('Loading wallet status...').start();

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

    // Get recent transactions
    const history = await TransactionHistory.getHistory(3);

    spinner.stop();

    // Display status
    console.log('\n' + chalk.bold('🦁 CLAWD Wallet Status\n'));

    console.log(chalk.bold('Wallet:'));
    console.log(`  Address: ${chalk.cyan(formatAddress(address, false))}`);
    console.log(`  Network: ${chalk.green(config.wallet.network)}`);

    console.log('\n' + chalk.bold('Balance:'));
    console.log(`  ${chalk.green(formatCurrency(balance.balance, balance.symbol))}`);

    console.log('\n' + chalk.bold('Security Limits:'));
    console.log(`  Max per transaction: ${formatCurrency(config.security.maxTransactionAmount)}`);
    console.log(`  Auto-approve under: ${formatCurrency(config.security.autoApproveUnder)}`);
    console.log(`  Daily limit: ${formatCurrency(config.security.dailyLimit)}`);

    if (history.length > 0) {
      console.log('\n' + chalk.bold('Recent Transactions:'));
      history.forEach(tx => {
        console.log(`  ${formatStatus(tx.status)} ${formatCurrency(tx.amount)} - ${tx.description}`);
        console.log(`    ${chalk.gray(tx.service)} • ${chalk.gray(formatTimestamp(tx.timestamp))}`);
      });
    } else {
      console.log('\n' + chalk.gray('No transactions yet'));
    }

    console.log('\n' + chalk.bold('MCP Server:'));
    console.log(`  Status: ${config.mcp.enabled ? chalk.green('Enabled') : chalk.red('Disabled')}`);
    console.log(`  Log level: ${config.mcp.logLevel}`);

    console.log('');

  } catch (error) {
    spinner.fail('Failed to load status');
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
