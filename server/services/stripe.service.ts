/**
 * Stripe Service
 * Handles all Stripe API interactions
 */

import Stripe from "stripe";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Initialize Stripe client
let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      logger.warn("STRIPE_SECRET_KEY not set - Stripe features will be disabled");
      throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });

    logger.info("Stripe client initialized");
  }

  return stripeClient;
}

/**
 * Create a Stripe customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });

    logger.info(`Stripe customer created: ${customer.id} for email: ${email}`);
    return customer;
  } catch (error) {
    logger.error("Error creating Stripe customer:", error);
    throw error;
  }
}

/**
 * Get a Stripe customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  try {
    const stripe = getStripeClient();
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  } catch (error) {
    logger.error(`Error retrieving Stripe customer ${customerId}:`, error);
    throw error;
  }
}

/**
 * Update a Stripe customer
 */
export async function updateCustomer(
  customerId: string,
  updates: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  try {
    const stripe = getStripeClient();
    return await stripe.customers.update(customerId, updates);
  } catch (error) {
    logger.error(`Error updating Stripe customer ${customerId}:`, error);
    throw error;
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    });

    logger.info(`Checkout session created: ${session.id} for customer: ${customerId}`);
    return session;
  } catch (error) {
    logger.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    logger.info(`Billing portal session created: ${session.id} for customer: ${customerId}`);
    return session;
  } catch (error) {
    logger.error("Error creating billing portal session:", error);
    throw error;
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripeClient();
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    logger.error(`Error retrieving subscription ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripeClient();
    
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    logger.error(`Error canceling subscription ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Resume a subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripeClient();
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    logger.error(`Error resuming subscription ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Update subscription (change plan)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripeClient();
    const subscription = await getSubscription(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "always_invoice",
    });
  } catch (error) {
    logger.error(`Error updating subscription ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * List all prices (for getting available plans)
 */
export async function listPrices(active: boolean = true): Promise<Stripe.Price[]> {
  try {
    const stripe = getStripeClient();
    const prices = await stripe.prices.list({
      active,
      type: "recurring",
    });

    return prices.data;
  } catch (error) {
    logger.error("Error listing Stripe prices:", error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    const stripe = getStripeClient();
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not set");
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    logger.error("Error verifying webhook signature:", error);
    throw error;
  }
}


