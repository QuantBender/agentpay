import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

// Webhook configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const TIMESTAMP_TOLERANCE = 300; // 5 minutes

interface WebhookPayload {
  event: 'payment.received' | 'payment.failed' | 'agent.created' | 'agent.funded';
  paymentId?: string;
  agent: string;
  amount?: string;
  serviceId?: string;
  requestId?: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
  chainId: number;
}

/**
 * Verify webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  timestamp: number
): boolean {
  // Check timestamp is within tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TIMESTAMP_TOLERANCE) {
    return false;
  }

  // Verify signature
  const message = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex');

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
 * POST /api/webhooks
 * Receive payment webhook notifications
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-agentpay-signature');
    const timestamp = request.headers.get('x-agentpay-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing signature or timestamp headers' },
        { status: 401 }
      );
    }

    const body = await request.text();

    // Verify the webhook signature
    if (!verifySignature(body, signature, parseInt(timestamp, 10))) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: WebhookPayload = JSON.parse(body);

    // Process the webhook based on event type
    switch (payload.event) {
      case 'payment.received':
        console.log('Payment received:', {
          paymentId: payload.paymentId,
          agent: payload.agent,
          amount: payload.amount,
          serviceId: payload.serviceId,
          requestId: payload.requestId,
        });
        // TODO: Handle payment received
        // - Update database
        // - Trigger service execution
        // - Send notifications
        break;

      case 'payment.failed':
        console.log('Payment failed:', {
          agent: payload.agent,
          requestId: payload.requestId,
        });
        // TODO: Handle failed payment
        break;

      case 'agent.created':
        console.log('Agent created:', {
          agent: payload.agent,
          transactionHash: payload.transactionHash,
        });
        // TODO: Handle agent creation
        break;

      case 'agent.funded':
        console.log('Agent funded:', {
          agent: payload.agent,
          amount: payload.amount,
        });
        // TODO: Handle agent funding
        break;

      default:
        console.log('Unknown event:', payload);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
    supportedEvents: [
      'payment.received',
      'payment.failed',
      'agent.created',
      'agent.funded',
    ],
  });
}
