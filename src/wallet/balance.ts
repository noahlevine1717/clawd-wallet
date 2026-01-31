/**
 * Balance checker for USDC on Base network
 */

import { ethers } from 'ethers';
import type { BalanceInfo } from '../types/index.js';

const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

export class BalanceChecker {
  private provider: ethers.Provider;
  private usdcContract: ethers.Contract;

  constructor(rpcUrl: string, usdcContractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.usdcContract = new ethers.Contract(usdcContractAddress, USDC_ABI, this.provider);
  }

  /**
   * Get USDC balance for an address
   */
  async getBalance(address: string): Promise<BalanceInfo> {
    try {
      const balance = await this.usdcContract.balanceOf(address);
      const decimals = await this.usdcContract.decimals();
      const symbol = await this.usdcContract.symbol();

      const formattedBalance = ethers.formatUnits(balance, decimals);

      return {
        address,
        balance: formattedBalance,
        decimals: Number(decimals),
        symbol
      };
    } catch (error) {
      throw new Error(`Failed to fetch balance: ${(error as Error).message}`);
    }
  }

  /**
   * Get raw balance (as BigInt)
   */
  async getRawBalance(address: string): Promise<bigint> {
    try {
      return await this.usdcContract.balanceOf(address);
    } catch (error) {
      throw new Error(`Failed to fetch raw balance: ${(error as Error).message}`);
    }
  }

  /**
   * Check if address has sufficient balance
   */
  async hasSufficientBalance(address: string, requiredAmount: number): Promise<boolean> {
    try {
      const balance = await this.getBalance(address);
      return parseFloat(balance.balance) >= requiredAmount;
    } catch (error) {
      return false;
    }
  }

  /**
   * Transfer USDC to a recipient
   * Returns the transaction hash
   */
  async transferUSDC(
    wallet: ethers.HDNodeWallet | ethers.Wallet,
    recipient: string,
    amount: number
  ): Promise<{ txHash: string; amount: string }> {
    try {
      // Validate recipient address
      if (!recipient || typeof recipient !== 'string') {
        throw new Error('Invalid recipient: address is required');
      }

      // Validate and checksum the address (throws if invalid)
      let checksummedRecipient: string;
      try {
        checksummedRecipient = ethers.getAddress(recipient);
      } catch {
        throw new Error(`Invalid recipient address: ${recipient}`);
      }

      // Prevent sending to zero address
      if (checksummedRecipient === ethers.ZeroAddress) {
        throw new Error('Cannot send to zero address');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      // Connect the wallet to the provider
      const connectedWallet = wallet.connect(this.provider);

      // Get decimals (USDC uses 6)
      const decimals = await this.usdcContract.decimals();

      // Convert amount to smallest unit
      const amountInUnits = ethers.parseUnits(amount.toString(), decimals);

      // Create contract instance with signer
      const contractWithSigner = this.usdcContract.connect(connectedWallet) as ethers.Contract;

      // Execute transfer (use checksummed address)
      const tx = await contractWithSigner.transfer(checksummedRecipient, amountInUnits);

      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        amount: amount.toString()
      };
    } catch (error) {
      throw new Error(`USDC transfer failed: ${(error as Error).message}`);
    }
  }
}
