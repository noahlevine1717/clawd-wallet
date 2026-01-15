/**
 * History command - View transaction history
 */

import chalk from 'chalk';
import { TransactionHistory } from '../../wallet/history.js';
import { formatCurrency, formatError, formatTimestamp, formatStatus } from '../utils/formatters.js';

export async function historyCommand(options: { limit?: number; json?: boolean }): Promise<void> {
  try {
    const limit = options.limit || 10;
    const history = await TransactionHistory.getHistory(limit);

    if (options.json) {
      console.log(JSON.stringify(history, null, 2));
      return;
    }

    if (history.length === 0) {
      console.log('\n' + chalk.gray('No transactions yet') + '\n');
      return;
    }

    console.log('\n' + chalk.bold(`📜 Transaction History (last ${limit})\n`));

    history.forEach((tx, index) => {
      console.log(chalk.bold(`${index + 1}. ${tx.description}`));
      console.log(`   ${formatStatus(tx.status)} ${formatCurrency(tx.amount, tx.currency)}`);
      console.log(`   ${chalk.gray(tx.service)}`);
      console.log(`   ${chalk.gray(formatTimestamp(tx.timestamp))}`);
      if (tx.txHash) {
        console.log(`   ${chalk.gray('TX: ' + tx.txHash)}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
