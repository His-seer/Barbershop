// =====================================================
// SMS Utility - Flexible SMS Sender
// =====================================================
// Configure your SMS provider in .env.local:
// SMS_PROVIDER=arkesel | hubtel | termii | mock
// SMS_API_KEY=your_api_key
// SMS_SENDER_ID=YourShopName

interface SMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface SMSConfig {
    provider: 'arkesel' | 'hubtel' | 'termii' | 'mock';
    apiKey: string;
    senderId: string;
}

// Get config from environment
function getConfig(): SMSConfig {
    return {
        provider: (process.env.SMS_PROVIDER as SMSConfig['provider']) || 'mock',
        apiKey: process.env.SMS_API_KEY || '',
        senderId: process.env.SMS_SENDER_ID || 'Barbershop',
    };
}

// Format phone number for Ghana (add country code if needed)
function formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
        cleaned = '233' + cleaned.slice(1);
    }

    // If doesn't start with 233, add it
    if (!cleaned.startsWith('233')) {
        cleaned = '233' + cleaned;
    }

    return cleaned;
}

// Mock SMS sender (for development)
async function sendMockSMS(to: string, message: string): Promise<SMSResult> {
    console.log('[MOCK SMS] Sent');
    return { success: true, messageId: 'mock-' + Date.now() };
}

// Arkesel SMS (Ghana)
async function sendArkeselSMS(to: string, message: string, config: SMSConfig): Promise<SMSResult> {
    try {
        const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
            method: 'POST',
            headers: {
                'api-key': config.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: config.senderId,
                message: message,
                recipients: [to],
            }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            return { success: true, messageId: data.data?.[0]?.id };
        } else {
            return { success: false, error: data.message || 'SMS failed' };
        }
    } catch (error) {
        console.error('Arkesel SMS error:', error);
        return { success: false, error: 'Network error' };
    }
}

// Hubtel SMS (Ghana)
async function sendHubtelSMS(to: string, message: string, config: SMSConfig): Promise<SMSResult> {
    try {
        const response = await fetch('https://smsc.hubtel.com/v1/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(config.apiKey).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                From: config.senderId,
                To: to,
                Content: message,
            }),
        });

        const data = await response.json();

        if (data.Status === 0) {
            return { success: true, messageId: data.MessageId };
        } else {
            return { success: false, error: data.Message || 'SMS failed' };
        }
    } catch (error) {
        console.error('Hubtel SMS error:', error);
        return { success: false, error: 'Network error' };
    }
}

// Termii SMS (Africa-wide)
async function sendTermiiSMS(to: string, message: string, config: SMSConfig): Promise<SMSResult> {
    try {
        const response = await fetch('https://api.ng.termii.com/api/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: config.apiKey,
                to: to,
                from: config.senderId,
                sms: message,
                type: 'plain',
                channel: 'generic',
            }),
        });

        const data = await response.json();

        if (data.code === 'ok') {
            return { success: true, messageId: data.message_id };
        } else {
            return { success: false, error: data.message || 'SMS failed' };
        }
    } catch (error) {
        console.error('Termii SMS error:', error);
        return { success: false, error: 'Network error' };
    }
}

// Main SMS sending function
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
    const config = getConfig();
    const formattedPhone = formatPhoneNumber(to);

    switch (config.provider) {
        case 'arkesel':
            return sendArkeselSMS(formattedPhone, message, config);
        case 'hubtel':
            return sendHubtelSMS(formattedPhone, message, config);
        case 'termii':
            return sendTermiiSMS(formattedPhone, message, config);
        case 'mock':
        default:
            return sendMockSMS(formattedPhone, message);
    }
}

// Convenience function for PIN notification
export async function sendPinNotification(phone: string, staffName: string, pin: string): Promise<SMSResult> {
    const message = `Hi ${staffName}! Your login PIN has been set to: ${pin}. Use this with your phone number to log in at the staff portal.`;
    return sendSMS(phone, message);
}

// Appointment Reminder (24h before)
export async function sendAppointmentReminder(
    booking: {
        customer_name: string;
        booking_date: string;
        booking_time: string;
        customer_phone: string;
    },
    shopName: string = 'His-seer Barbershop'
): Promise<SMSResult> {
    // Format: "Hi John, reminder for your appointment tomorrow at 10:00 with His-seer Barbershop. See you soon!"
    const time = booking.booking_time.substring(0, 5); // "14:00:00" -> "14:00"
    const message = `Hi ${booking.customer_name}, reminder for your appointment tomorrow at ${time} with ${shopName}. See you soon!`;

    return sendSMS(booking.customer_phone, message);
}
