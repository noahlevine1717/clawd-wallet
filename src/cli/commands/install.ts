/**
 * Install command - Add MCP server to Claude Code config
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import ora from 'ora';
import { formatError, formatSuccess } from '../utils/formatters.js';

const CLAUDE_CONFIG_PATH = join(homedir(), '.claude', 'config.json');

export async function installCommand(): Promise<void> {
  const spinner = ora('Configuring Claude Code...').start();

  try {
    // Ensure .claude directory exists
    const claudeDir = join(homedir(), '.claude');
    await fs.mkdir(claudeDir, { recursive: true });

    // Load existing config or create new
    let config: any = {};
    try {
      const data = await fs.readFile(CLAUDE_CONFIG_PATH, 'utf-8');
      config = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, start with empty config
      config = { mcpServers: {} };
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Check if already installed
    if (config.mcpServers['clawd-wallet']) {
      spinner.warn('CLAWD Wallet MCP server is already configured');
      console.log('\n' + chalk.yellow('To reinstall, run: clawd uninstall && clawd install') + '\n');
      return;
    }

    // Get path to MCP server
    const mcpServerPath = join(process.cwd(), 'dist', 'mcp-server', 'index.js');

    // Add CLAWD Wallet MCP server
    config.mcpServers['clawd-wallet'] = {
      command: 'node',
      args: [mcpServerPath],
      env: {
        CLAWD_CONFIG_PATH: join(homedir(), '.clawd', 'config.json')
      }
    };

    // Save config
    await fs.writeFile(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

    spinner.succeed('Claude Code configured');

    console.log('\n' + formatSuccess('✓ CLAWD Wallet MCP server installed'));
    console.log('\n' + chalk.bold('Next steps:'));
    console.log('  1. Restart Claude Code');
    console.log('  2. Try: "Check my CLAWD wallet balance"');
    console.log('');

  } catch (error) {
    spinner.fail('Failed to configure Claude Code');
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
