import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export async function createPaymentIntent(
  amount: number,
  metadata: {
    userId: string;
    propertyId: string;
    tokenCount: number;
    phase: string;
  }
): Promise<PaymentIntent | null> {
  if (!stripe) {
    console.log("[Payments] Stripe not configured - simulating payment intent");
    return {
      id: `sim_${Date.now()}`,
      clientSecret: `sim_secret_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "usd",
      status: "requires_payment_method",
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: {
        userId: metadata.userId,
        propertyId: metadata.propertyId,
        tokenCount: metadata.tokenCount.toString(),
        phase: metadata.phase,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("[Payments] Error creating payment intent:", error);
    return null;
  }
}

export interface PaymentMetadata {
  userId: string;
  propertyId: string;
  tokenCount: number;
  phase: string;
}

export interface VerifiedPayment {
  success: boolean;
  paymentIntentId?: string;
  metadata?: PaymentMetadata;
  amount?: number;
  error?: string;
}

export async function confirmPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
  if (!stripe) {
    console.log("[Payments] Stripe not configured - simulating payment confirmation");
    return { success: true, paymentIntentId };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === "succeeded") {
      return { success: true, paymentIntentId };
    }
    
    return { success: false, error: `Payment status: ${paymentIntent.status}` };
  } catch (error) {
    console.error("[Payments] Error confirming payment:", error);
    return { success: false, error: "Failed to confirm payment" };
  }
}

export async function verifyPaymentAndGetMetadata(paymentIntentId: string, expectedUserId: string): Promise<VerifiedPayment> {
  if (!stripe) {
    console.log("[Payments] Stripe not configured - simulating payment verification");
    if (paymentIntentId.startsWith("sim_")) {
      return { 
        success: true, 
        paymentIntentId,
        error: "Simulated payment - cannot verify metadata"
      };
    }
    return { success: false, error: "Invalid simulated payment ID" };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      return { success: false, error: `Payment not completed: ${paymentIntent.status}` };
    }

    const metadata = paymentIntent.metadata;
    if (metadata.userId !== expectedUserId) {
      return { success: false, error: "Payment belongs to different user" };
    }

    return {
      success: true,
      paymentIntentId,
      metadata: {
        userId: metadata.userId,
        propertyId: metadata.propertyId,
        tokenCount: parseInt(metadata.tokenCount, 10),
        phase: metadata.phase,
      },
      amount: paymentIntent.amount / 100,
    };
  } catch (error) {
    console.error("[Payments] Error verifying payment:", error);
    return { success: false, error: "Failed to verify payment" };
  }
}

export async function processRefund(
  paymentIntentId: string,
  amount?: number
): Promise<PaymentResult> {
  if (!stripe) {
    console.log("[Payments] Stripe not configured - simulating refund");
    return { success: true, paymentIntentId };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return { success: refund.status === "succeeded", paymentIntentId };
  } catch (error) {
    console.error("[Payments] Error processing refund:", error);
    return { success: false, error: "Failed to process refund" };
  }
}

export function isStripeConfigured(): boolean {
  return stripe !== null;
}

export function getStripe(): Stripe | null {
  return stripe;
}

export interface WebhookPayload {
  type: string;
  data: {
    object: {
      id: string;
      metadata: {
        userId: string;
        propertyId: string;
        tokenCount: string;
        phase: string;
      };
      amount: number;
      status: string;
    };
  };
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string,
  webhookSecret: string
): WebhookPayload | null {
  if (!stripe) {
    console.log("[Payments] Stripe not configured - cannot verify webhook");
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret) as unknown as WebhookPayload;
  } catch (error) {
    console.error("[Payments] Webhook signature verification failed:", error);
    return null;
  }
}
