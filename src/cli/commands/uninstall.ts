/**
 * Uninstall command - Remove MCP server from Claude Code config
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { Keychain } from '../../wallet/keychain.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

const CLAUDE_CONFIG_PATH = join(homedir(), '.claude', 'config.json');

export async function uninstallCommand(options: { removeWallet?: boolean }): Promise<void> {
  const spinner = ora('Removing CLAWD Wallet from Claude Code...').start();

  try {
    // Load existing config
    let config: any = {};
    try {
      const data = await fs.readFile(CLAUDE_CONFIG_PATH, 'utf-8');
      config = JSON.parse(data);
    } catch (error) {
      spinner.warn('Claude Code config not found');
      return;
    }

    // Check if CLAWD Wallet is configured
    if (!config.mcpServers || !config.mcpServers['clawd-wallet']) {
      spinner.warn('CLAWD Wallet MCP server is not configured');
      return;
    }

    // Remove CLAWD Wallet MCP server
    delete config.mcpServers['clawd-wallet'];

    // Save config
    await fs.writeFile(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

    spinner.succeed('Removed from Claude Code config');

    // Ask about removing wallet
    if (!options.removeWallet) {
      const { removeWallet } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'removeWallet',
          message: 'Also remove wallet and all data? (THIS CANNOT BE UNDONE)',
          default: false
        }
      ]);

      options.removeWallet = removeWallet;
    }

    if (options.removeWallet) {
      const deleteSpinner = ora('Removing wallet and data...').start();

      // Delete wallet from keychain
      await Keychain.deletePrivateKey();

      // Delete config and history files
      const clawdDir = join(homedir(), '.clawd');
      try {
        await fs.rm(clawdDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore errors if directory doesn't exist
      }

      deleteSpinner.succeed('Wallet and data removed');
    }

    console.log('\n' + formatSuccess('✓ CLAWD Wallet uninstalled') + '\n');

  } catch (error) {
    spinner.fail('Failed to uninstall');
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
