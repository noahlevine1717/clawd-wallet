/**
 * x402 payment execution handler
 */

import { ethers } from 'ethers';
import { X402Client } from './client.js';
import { WalletManager } from '../wallet/manager.js';
import { BalanceChecker } from '../wallet/balance.js';
import { TransactionHistory } from '../wallet/history.js';
import { SpendLimits } from '../security/limits.js';
import { AuditLogger } from '../security/audit.js';
import { ConfigManager } from '../config/manager.js';
import type { PaymentDetails, Transaction } from '../types/index.js';

export class PaymentHandler {
  private walletManager: WalletManager;
  private balanceChecker: BalanceChecker | null = null;

  constructor() {
    this.walletManager = new WalletManager();
  }

  /**
   * Initialize payment handler
   */
  async initialize(): Promise<void> {
    await this.walletManager.loadFromKeychain();
    const config = await ConfigManager.loadConfig();
    this.balanceChecker = new BalanceChecker(
      config.wallet.rpcUrl,
      config.wallet.usdcContract
    );
  }

  /**
   * Execute full x402 payment flow
   */
  async executePayment(
    url: string,
    method: string = 'GET',
    body?: string,
    description?: string
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      // Step 1: Make initial request
      const initialResponse = await X402Client.makeRequest(url, { method, body });

      // Step 2: Check if payment is required
      if (initialResponse.status !== 402) {
        return {
          success: true,
          response: initialResponse.body ? JSON.parse(initialResponse.body) : null
        };
      }

      // Step 3: Parse payment details
      const wwwAuth = initialResponse.headers['www-authenticate'];
      if (!wwwAuth) {
        return {
          success: false,
          error: 'Payment required but no payment details provided'
        };
      }

      const paymentInfo = X402Client.parsePaymentHeaders(wwwAuth);
      if (!paymentInfo) {
        return {
          success: false,
          error: 'Invalid payment details in response'
        };
      }

      // Step 4: Validate amount
      const amount = parseFloat(paymentInfo.amount);
      const validation = await this.validateAmount(amount);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Step 5: Check balance
      const hasBalance = await this.checkBalance(amount);
      if (!hasBalance) {
        return {
          success: false,
          error: 'Insufficient balance'
        };
      }

      // Step 6: Create payment details
      const paymentDetails: PaymentDetails = {
        recipient: paymentInfo.recipient,
        amount,
        currency: paymentInfo.currency,
        description: description || paymentInfo.description || 'x402 payment',
        nonce: paymentInfo.nonce
      };

      // Step 7: Generate payment proof
      const wallet = this.walletManager.getWallet();
      const signature = await X402Client.generatePaymentProof(wallet, paymentDetails);

      // Step 8: Create authorization header
      const authHeader = X402Client.createAuthorizationHeader(
        wallet.address,
        paymentDetails.recipient,
        paymentInfo.amount,
        paymentDetails.currency,
        paymentDetails.nonce,
        signature
      );

      // Step 9: Retry request with payment proof
      const paymentResponse = await X402Client.makeRequest(url, {
        method,
        body,
        headers: {
          'Authorization': authHeader
        }
      });

      // Step 10: Log transaction
      if (paymentResponse.status === 200) {
        const transaction: Transaction = {
          id: ethers.hexlify(ethers.randomBytes(16)),
          timestamp: Date.now(),
          service: new URL(url).hostname,
          description: paymentDetails.description,
          amount,
          currency: paymentDetails.currency,
          status: 'success'
        };

        await TransactionHistory.addTransaction(transaction);
        await AuditLogger.logAction('payment_executed', {
          url,
          amount,
          service: transaction.service
        });

        return {
          success: true,
          response: paymentResponse.body ? JSON.parse(paymentResponse.body) : null
        };
      }

      // Payment failed
      await AuditLogger.logAction('payment_failed', {
        url,
        amount,
        status: paymentResponse.status
      });

      return {
        success: false,
        error: `Payment failed with status ${paymentResponse.status}`
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Validate transaction amount against limits
   */
  async validateAmount(amount: number): Promise<{ valid: boolean; errors: string[] }> {
    return await SpendLimits.validateTransaction(amount);
  }

  /**
   * Check if wallet has sufficient balance
   */
  async checkBalance(requiredAmount: number): Promise<boolean> {
    if (!this.balanceChecker) {
      throw new Error('Payment handler not initialized');
    }

    const wallet = this.walletManager.getWallet();
    return await this.balanceChecker.hasSufficientBalance(wallet.address, requiredAmount);
  }
}
