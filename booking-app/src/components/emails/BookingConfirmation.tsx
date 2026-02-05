import * as React from 'react';
import {
    Html,
    Body,
    Head,
    Heading,
    Hr,
    Container,
    Preview,
    Section,
    Text,
    Link,
} from '@react-email/components';

interface BookingConfirmationProps {
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
    reference: string;
    shopName?: string;
    shopAddress?: string;
}

export const BookingConfirmationEmail = ({
    customerName,
    serviceName,
    date,
    time,
    price,
    reference,
    shopName = 'His-seer Barbershop',
    shopAddress = '123 Main Street, Accra, Ghana',
}: BookingConfirmationProps) => {
    const previewText = `Booking Confirmed: ${serviceName} on ${date}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Booking Confirmed! ✅</Heading>
                    <Text style={text}>Hi {customerName},</Text>
                    <Text style={text}>
                        Your appointment at <strong>{shopName}</strong> has been successfully booked.
                        We look forward to seeing you!
                    </Text>

                    <Section style={box}>
                        <Text style={paragraph}>
                            <strong>Service:</strong> {serviceName}
                        </Text>
                        <Text style={paragraph}>
                            <strong>Date:</strong> {date}
                        </Text>
                        <Text style={paragraph}>
                            <strong>Time:</strong> {time}
                        </Text>
                        <Text style={paragraph}>
                            <strong>Total Price:</strong> GH₵{price.toFixed(2)}
                        </Text>
                        <Hr style={hr} />
                        <Text style={paragraph}>
                            <strong>Reference:</strong> {reference}
                        </Text>
                    </Section>

                    <Text style={text}>
                        If you need to reschedule or cancel, please contact us or verify your booking using your reference code.
                    </Text>

                    <Text style={footer}>
                        {shopName} • {shopAddress}
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default BookingConfirmationEmail;

// Styles
const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const box = {
    padding: '24px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    marginTop: '24px',
    marginBottom: '24px',
};

const h1 = {
    color: '#000000',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.25',
    marginBottom: '24px',
};

const text = {
    color: '#333333',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
};

const paragraph = {
    color: '#333333',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '8px 0',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '48px',
};
