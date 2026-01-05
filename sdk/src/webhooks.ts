import { createHmac, timingSafeEqual } from 'crypto';
import type { WebhookPayload, WebhookConfig } from './types';

/**
 * WebhookHandler - Utility for service providers to handle payment webhooks
 * 
 * @example
 * ```typescript
 * const webhookHandler = new WebhookHandler({
 *   secret: process.env.WEBHOOK_SECRET,
 * });
 * 
 * // In your webhook endpoint
 * app.post('/webhook', (req, res) => {
 *   const signature = req.headers['x-agentpay-signature'];
 *   const timestamp = req.headers['x-agentpay-timestamp'];
 *   
 *   if (webhookHandler.verify(req.body, signature, timestamp)) {
 *     const payload = webhookHandler.parse(req.body);
 *     // Handle the payment
 *     console.log(`Payment received: ${payload.amount} MNEE`);
 *   }
 * });
 * ```
 */
export class WebhookHandler {
  private secret: string;
  private timestampTolerance: number;

  constructor(config: WebhookConfig) {
    this.secret = config.secret;
    this.timestampTolerance = config.timestampTolerance || 300; // 5 minutes default
  }

  /**
   * Generate a webhook signature
   */
  sign(payload: string, timestamp: number): string {
    const message = `${timestamp}.${payload}`;
    return createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }

  /**
   * Verify a webhook signature
   */
  verify(
    payload: string | object,
    signature: string,
    timestamp: string | number
  ): boolean {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

    // Check timestamp is within tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > this.timestampTolerance) {
      return false;
    }

    // Verify signature
    const expectedSignature = this.sign(payloadStr, ts);
    
    try {
      return timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  /**
   * Parse webhook payload
   */
  parse(payload: string | object): WebhookPayload {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return data as WebhookPayload;
  }

  /**
   * Create a webhook payload (for testing or sending)
   */
  createPayload(params: {
    paymentId: string;
    agent: string;
    amount: string;
    serviceId: string;
    requestId: string;
    transactionHash: string;
    blockNumber: number;
  }): WebhookPayload {
    return {
      event: 'payment.received',
      paymentId: params.paymentId,
      agent: params.agent as `0x${string}`,
      amount: params.amount,
      serviceId: params.serviceId,
      requestId: params.requestId,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: params.transactionHash,
      blockNumber: params.blockNumber,
    };
  }

  /**
   * Generate headers for sending a webhook
   */
  generateHeaders(payload: string | object): {
    'Content-Type': string;
    'X-AgentPay-Signature': string;
    'X-AgentPay-Timestamp': string;
  } {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.sign(payloadStr, timestamp);

    return {
      'Content-Type': 'application/json',
      'X-AgentPay-Signature': signature,
      'X-AgentPay-Timestamp': timestamp.toString(),
    };
  }
}

/**
 * Send a webhook notification
 */
export async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const handler = new WebhookHandler({ secret });
  const payloadStr = JSON.stringify(payload);
  const headers = handler.generateHeaders(payloadStr);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payloadStr,
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
