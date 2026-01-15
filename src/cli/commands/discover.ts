/**
 * Discover command - Find x402 services
 */

import chalk from 'chalk';
import ora from 'ora';
import { ServiceDiscovery } from '../../x402/discovery.js';
import { formatCurrency, formatError } from '../utils/formatters.js';

export async function discoverCommand(options: { category?: string; query?: string }): Promise<void> {
  const spinner = ora('Discovering x402 services...').start();

  try {
    const services = await ServiceDiscovery.discoverServices(options.query, options.category);

    spinner.stop();

    if (services.length === 0) {
      console.log('\n' + chalk.gray('No services found') + '\n');
      return;
    }

    console.log('\n' + chalk.bold(`🔍 Found ${services.length} x402 service(s)\n`));

    services.forEach((service, index) => {
      console.log(chalk.bold(`${index + 1}. ${service.name}`));
      console.log(`   ${chalk.gray(service.description)}`);
      console.log(`   ${chalk.green(formatCurrency(service.pricing.amount, service.pricing.currency))} per ${service.pricing.per}`);
      console.log(`   ${chalk.cyan(service.url)}`);
      console.log(`   ${chalk.gray('Category: ' + service.category)}`);
      console.log('');
    });

  } catch (error) {
    spinner.fail('Failed to discover services');
    console.error(formatError((error as Error).message));
    process.exit(1);
  }
}
