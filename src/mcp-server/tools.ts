/**
 * MCP tool implementations
 */

import { WalletManager } from '../wallet/manager.js';
import { BalanceChecker } from '../wallet/balance.js';
import { TransactionHistory } from '../wallet/history.js';
import { PaymentHandler } from '../x402/payment.js';
import { ServiceDiscovery } from '../x402/discovery.js';
import { ConfigManager } from '../config/manager.js';
import { SpendLimits } from '../security/limits.js';
import type { PaymentRequest } from '../types/index.js';

export class MCPTools {
  /**
   * Tool: x402_payment_request
   * Make an x402 payment request to a service
   */
  static async paymentRequest(args: PaymentRequest): Promise<any> {
    try {
      const { url, method, description, maxAmount, body } = args;

      // Validate max amount if provided
      if (maxAmount) {
        const validation = await SpendLimits.validateTransaction(maxAmount);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.errors.join(', ')
          };
        }
      }

      // Execute payment
      const handler = new PaymentHandler();
      await handler.initialize();

      const result = await handler.executePayment(url, method, body, description);

      return result;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Tool: x402_check_balance
   * Check current USDC balance
   */
  static async checkBalance(): Promise<any> {
    try {
      const config = await ConfigManager.loadConfig();
      const walletManager = new WalletManager();
      await walletManager.loadFromKeychain();

      const balanceChecker = new BalanceChecker(
        config.wallet.rpcUrl,
        config.wallet.usdcContract
      );

      const balance = await balanceChecker.getBalance(walletManager.getAddress());

      return {
        success: true,
        balance: {
          address: balance.address,
          amount: balance.balance,
          currency: balance.symbol,
          decimals: balance.decimals
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Tool: x402_get_address
   * Get wallet address for funding
   */
  static async getAddress(): Promise<any> {
    try {
      const config = await ConfigManager.loadConfig();

      return {
        success: true,
        address: config.wallet.address,
        network: config.wallet.network,
        fundingInstructions: 'Send USDC on Base network to this address'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Tool: x402_transaction_history
   * Get recent transaction history
   */
  static async transactionHistory(limit: number = 10): Promise<any> {
    try {
      const history = await TransactionHistory.getHistory(limit);

      return {
        success: true,
        transactions: history,
        count: history.length
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Tool: x402_discover_services
   * Discover available x402 services
   */
  static async discoverServices(category?: string, query?: string): Promise<any> {
    try {
      const services = await ServiceDiscovery.discoverServices(query, category);

      return {
        success: true,
        services,
        count: services.length
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}
