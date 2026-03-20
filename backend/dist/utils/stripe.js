"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_CONFIG = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
}
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia', // Using a stable version
    typescript: true,
});
exports.STRIPE_CONFIG = {
    CURRENCY: 'etb', // Stripe supports ETB for certain accounts, otherwise use 'usd' with conversion
    PLANS: {
        KG_G5: {
            MONTHLY: 100,
            YEARLY: 100 * 12 * 0.95,
            PRICE_ID_MONTHLY: 'price_kg_monthly', // These would be real IDs in a live environment
            PRICE_ID_YEARLY: 'price_kg_yearly',
        },
        G6_G12: {
            MONTHLY: 200,
            YEARLY: 200 * 12 * 0.95,
            PRICE_ID_MONTHLY: 'price_g612_monthly',
            PRICE_ID_YEARLY: 'price_g612_yearly',
        },
        UNIVERSITY: {
            MONTHLY: 300,
            YEARLY: 300 * 12 * 0.95,
            PRICE_ID_MONTHLY: 'price_uni_monthly',
            PRICE_ID_YEARLY: 'price_uni_yearly',
        }
    }
};
