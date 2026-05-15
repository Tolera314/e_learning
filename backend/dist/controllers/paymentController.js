"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = require("../utils/stripe");
const prisma_1 = require("../utils/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create a Stripe Checkout Session
 */
const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { segment, interval } = req.body; // e.g. UNIVERSITY, YEARLY
        if (!userId || !segment || !interval) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { subscriptions: { where: { expiresAt: { gt: new Date() }, segmentAccess: segment } } }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // SECURITY: Prevent duplicate active subscriptions for the same segment
        if (user.subscriptions.length > 0) {
            return res.status(400).json({ error: 'You already have an active subscription for this segment.' });
        }
        const priceConfig = stripe_1.STRIPE_CONFIG.PLANS[segment][interval];
        const amount = Math.round(priceConfig * 100);
        // SECURITY: Use Idempotency key to prevent double charging on retry
        const idempotencyKey = `checkout-${userId}-${segment}-${interval}-${Date.now()}`;
        // In production, you would use actual price IDs from your Stripe dashboard
        // For this implementation, we'll use line_items for direct control or mock IDs
        const session = await stripe_1.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: stripe_1.STRIPE_CONFIG.CURRENCY,
                        product_data: {
                            name: `Ethio-Digital Academy: ${segment} Access`,
                            description: `${interval} Subscription for ${segment} Educational Segment`,
                        },
                        unit_amount: amount,
                        recurring: { interval: interval === 'YEARLY' ? 'year' : 'month' },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard/student/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/student/subscription/cancel`,
            customer_email: user.email || undefined,
            metadata: {
                userId,
                segment,
                interval,
            },
        }, { idempotencyKey });
        res.status(200).json({ url: session.url });
    }
    catch (error) {
        logger_1.default.error({ err: error.message }, 'Stripe Checkout Error');
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
/**
 * Handle Stripe Webhooks
 */
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !endpointSecret) {
        return res.status(400).send('Webhook Error: Missing signature or secret');
    }
    let event;
    try {
        // rawBody is required for webhook signature verification
        event = stripe_1.stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        logger_1.default.error({ err: err.message }, 'Webhook Signature Verification Failed');
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await fulfillSubscription(session);
            break;
        case 'invoice.payment_succeeded': {
            // Renew subscription expiry on each successful recurring billing cycle
            const invoice = event.data.object;
            if (invoice.subscription) {
                await renewSubscriptionExpiry(invoice.subscription, invoice.lines?.data?.[0]?.plan?.interval);
            }
            break;
        }
        case 'customer.subscription.deleted':
            // Handle cancellation
            const subscription = event.data.object;
            await revokeSubscription(subscription.id);
            break;
        default:
            logger_1.default.info({ type: event.type }, 'Unhandled stripe event');
    }
    res.status(200).json({ received: true });
};
exports.handleWebhook = handleWebhook;
async function fulfillSubscription(session) {
    const { userId, segment, interval } = session.metadata;
    if (!userId || !segment) {
        logger_1.default.error({ sessionId: session.id }, 'Missing metadata in checkout session');
        return;
    }
    // Verify user still exists
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        logger_1.default.error({ userId }, 'Fulfillment failed: User missing');
        return;
    }
    const expiryDate = new Date();
    const normalizedInterval = interval?.toUpperCase();
    if (normalizedInterval === 'YEARLY') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    await prisma_1.prisma.subscription.upsert({
        where: { stripeSessionId: session.id },
        create: {
            studentId: userId,
            segmentAccess: segment,
            startsAt: new Date(),
            expiresAt: expiryDate,
            planType: normalizedInterval === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
            isTrial: false,
            stripeSessionId: session.id,
            // Store the Stripe subscription ID so we can revoke it later via webhook
            stripeSubscriptionId: session.subscription ?? null,
        },
        update: {
            expiresAt: expiryDate,
            isTrial: false,
            stripeSubscriptionId: session.subscription ?? undefined,
        }
    });
    logger_1.default.info({ userId, segment }, 'Subscription fulfilled successfully');
}
/**
 * Revoke a subscription when Stripe fires customer.subscription.deleted.
 * Sets expiresAt to now() so the student immediately loses access.
 * The stripeSubscriptionId is stored in the subscription metadata at fulfillment time.
 */
async function revokeSubscription(stripeSubscriptionId) {
    try {
        // Find the subscription via the Stripe subscription ID stored in metadata.
        // We store this during fulfillment so we can look it up here.
        const subscription = await prisma_1.prisma.subscription.findFirst({
            where: { stripeSubscriptionId },
        });
        if (!subscription) {
            // It's possible the session hasn't been fulfilled yet — log and move on
            logger_1.default.warn({ stripeSubscriptionId }, 'Revocation: No matching subscription found in DB');
            return;
        }
        // Immediately expire the subscription so the student loses access now
        await prisma_1.prisma.subscription.update({
            where: { id: subscription.id },
            data: { expiresAt: new Date() },
        });
        logger_1.default.info({ subscriptionId: subscription.id, studentId: subscription.studentId }, 'Subscription revoked successfully via Stripe webhook');
    }
    catch (error) {
        logger_1.default.error({ err: error.message, stripeSubscriptionId }, 'Failed to revoke subscription');
    }
}
/**
 * Extend a subscription's expiresAt date on each successful recurring payment.
 * This keeps the subscription alive for the next billing cycle.
 */
async function renewSubscriptionExpiry(stripeSubscriptionId, interval) {
    try {
        const subscription = await prisma_1.prisma.subscription.findFirst({
            where: { stripeSubscriptionId },
        });
        if (!subscription)
            return;
        const newExpiry = new Date(subscription.expiresAt);
        if (interval === 'year') {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        }
        else {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
        }
        await prisma_1.prisma.subscription.update({
            where: { id: subscription.id },
            data: { expiresAt: newExpiry },
        });
        logger_1.default.info({ subscriptionId: subscription.id, newExpiry }, 'Subscription renewed via payment_succeeded webhook');
    }
    catch (error) {
        logger_1.default.error({ err: error.message, stripeSubscriptionId }, 'Failed to renew subscription expiry');
    }
}
