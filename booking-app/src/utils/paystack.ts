'use server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
// These should naturally come from env or database config in production
// For Phase 2, we respect the plan's requirement for these codes
const SUBACCOUNT_OPS = process.env.PAYSTACK_SUBACCOUNT_OPS || 'ACCT_OWNER_OPS';
const SUBACCOUNT_SVC = process.env.PAYSTACK_SUBACCOUNT_SVC || 'ACCT_OWNER_SVC';
const BOOKING_FEE_GHS = 20;

interface InitializePaymentParams {
    email: string;
    amountGHS: number; // Total amount in GHS
    reference: string;
    metadata?: Record<string, unknown>;
    callbackUrl?: string;
}

export async function initializePayment({ email, amountGHS, reference, metadata, callbackUrl }: InitializePaymentParams) {
    const amountKobo = Math.round(amountGHS * 100);
    console.log("Initializing payment", { reference });

    if (!PAYSTACK_SECRET_KEY) {
        console.warn('PAYSTACK_SECRET_KEY not set - using mock payment response');
        const encodedDetails = encodeURIComponent(JSON.stringify(metadata || {}));
        // Mock response for development if keys aren't set
        const mockResponse = {
            status: true,
            message: 'Authorization URL created (Mock)',
            data: {
                authorization_url: `/success?reference=${reference}&mock=true&details=${encodedDetails}&amount=${amountKobo}`,
                access_code: 'mock_code',
                reference,
            },
        };
        console.log('Returning mock payment response');
        return mockResponse;
    }
    const bookingFeeKobo = BOOKING_FEE_GHS * 100;

    // Calculate shares
    // If total is less than booking fee (unlikely but possible in testing), give all to OPS
    const opsShare = amountKobo >= bookingFeeKobo ? bookingFeeKobo : amountKobo;
    const svcShare = amountKobo - opsShare;

    // Construct Dynamic Split Payload
    // Paystack Split API allows defining shares per transaction
    const splitPayload = {
        type: 'flat',
        bearer_type: 'account',
        subaccounts: [
            { subaccount: SUBACCOUNT_OPS, share: opsShare },
            { subaccount: SUBACCOUNT_SVC, share: svcShare }
        ]
    };

    try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: amountKobo,
                reference,
                metadata,
                callback_url: callbackUrl,
                // Only include split if we have valid subaccount codes (not placeholders)
                // For development safety, we'll omit split if codes are defaults/placeholders
                ...(SUBACCOUNT_OPS.startsWith('ACCT_') ? {} : { split: splitPayload }),
            }),
        });

        const data = await response.json();
        // Avoid logging full Paystack response to prevent leaking PII/metadata

        if (!response.ok) {
            console.error('Paystack API Error:', response.status, data);
            return { status: false, message: data?.message || 'Payment initialization failed' };
        }

        return data;
    } catch (error) {
        console.error('Paystack Initialization Error:', error);
        return { status: false, message: 'Payment initialization failed', error: String(error) };
    }
}

export async function verifyPayment(reference: string, isMock: boolean = false) {
    if (!PAYSTACK_SECRET_KEY) {
        // Mock verification
        if (isMock || reference.includes('mock')) return { status: true, data: { status: 'success', reference } };
        return { status: false, message: 'Missing Keys' };
    }

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
            cache: 'no-store', // Always fetch fresh
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Paystack Verification Error:', error);
        return { status: false, message: 'Verification failed' };
    }
}
