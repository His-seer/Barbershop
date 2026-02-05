import { Resend } from 'resend';

// Helper to get Resend instance safely
// This prevents build errors if env var is missing during build
const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
        return null;
    }
    return new Resend(apiKey);
};

interface SendEmailParams {
    to: string;
    subject: string;
    react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
    const resend = getResend();

    // Mock mode if no API key
    if (!resend) {
        console.log('Mock Email Sent');
        return { success: true, id: 'mock-email-id' };
    }

    try {
        const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        const data = await resend.emails.send({
            from,
            to,
            subject,
            react,
        });

        if (data.error) {
            console.error('Error sending email:', data.error);
            return { success: false, error: data.error };
        }

        return { success: true, id: data.data?.id };
    } catch (error) {
        console.error('Unexpected error sending email:', error);
        return { success: false, error };
    }
}
