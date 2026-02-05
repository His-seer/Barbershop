import { verifyPaystackPayment as verifyPaystackPaymentAction, saveBookingAfterPayment as saveBookingAfterPaymentAction } from '@/app/book/actions';
import { redirect } from 'next/navigation';
import { SuccessView } from '@/components/booking/SuccessView';
import type { CreateBookingData } from '@/types/database';
import { verifyPaystackPayment, saveBookingAfterPayment } from '@/app/book/actions';

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ reference?: string; mock?: string; details?: string; amount?: string }>;
}) {
    const resolvedParams = await searchParams;
    const { reference: rawReference, mock, details, amount: mockAmount } = resolvedParams;

    // Handle case where reference is an array (due to Paystack appending it to our existing param)
    const reference = Array.isArray(rawReference) ? rawReference[0] : rawReference;

    if (!reference) {
        redirect('/');
    }

    // Verify the transaction with Paystack
    const verification = mock === 'true'
        ? { success: true, data: { status: 'success', amount: parseInt(mockAmount || '0') } }
        : await verifyPaystackPaymentAction(reference);

    const isSuccess = verification.success && verification.data?.status === 'success';

    // Determine amount
    let finalAmount = '0.00';
    if (mock === 'true' && mockAmount) {
        finalAmount = (parseInt(mockAmount) / 100).toFixed(2);
    } else if (verification.data?.amount) {
        finalAmount = (verification.data.amount / 100).toFixed(2);
    }

    // Parse metadata from payment
    let bookingDetails: Record<string, unknown> = {};
    try {
        if (details) {
            bookingDetails = JSON.parse(decodeURIComponent(details));
        } else if (verification.data?.metadata) {
            bookingDetails = verification.data.metadata as Record<string, unknown>;
        }
    } catch (e) {
        console.error("Failed to parse booking details", e);
    }

    let bookingId: string | undefined;

    // Save booking to Supabase if payment successful
    if (isSuccess && reference) {
        // Calculate service and addons prices
        const totalAmount = parseFloat(finalAmount);
        const servicePrice = typeof bookingDetails.servicePrice === 'number' ? bookingDetails.servicePrice : totalAmount;
        const addonsPrice = typeof bookingDetails.addonsPrice === 'number' ? bookingDetails.addonsPrice : 0;

        const bookingData: CreateBookingData = {
            customer_name: typeof bookingDetails.customerName === 'string' ? bookingDetails.customerName : 'Unknown',
            customer_email: typeof bookingDetails.customerEmail === 'string' ? bookingDetails.customerEmail : '',
            customer_phone: typeof bookingDetails.customerPhone === 'string' ? bookingDetails.customerPhone : undefined,
            prefer_email_only: typeof bookingDetails.preferEmailOnly === 'boolean' ? bookingDetails.preferEmailOnly : false,
            reminder_preference:
                bookingDetails.reminderPreference === 'email_only' || bookingDetails.reminderPreference === 'email_sms'
                    ? bookingDetails.reminderPreference
                    : 'email_sms',
            customer_notes: typeof bookingDetails.customerNotes === 'string' ? bookingDetails.customerNotes : undefined,
            service_id: typeof bookingDetails.serviceId === 'string' ? bookingDetails.serviceId : '',
            staff_id: typeof bookingDetails.staffId === 'string' ? bookingDetails.staffId : '',
            booking_date: typeof bookingDetails.bookingDate === 'string' ? bookingDetails.bookingDate : '',
            booking_time: typeof bookingDetails.bookingTime === 'string' ? bookingDetails.bookingTime : '',
            service_price: servicePrice,
            addons_price: addonsPrice,
            total_price: totalAmount,
            addon_ids: Array.isArray(bookingDetails.addonIds) ? (bookingDetails.addonIds.filter((id) => typeof id === 'string') as string[]) : [],
            payment_reference: reference,
            paystack_reference: reference,
        };

        const result = await saveBookingAfterPaymentAction(bookingData);

        if (result.success) {
            bookingId = result.bookingId;
        } else {
            console.error('Failed to save booking:', result.error);
        }
    }

    return (
        <div className="min-h-screen bg-richblack-900 text-white flex flex-col items-center justify-center p-4 font-outfit">
            <SuccessView
                isSuccess={isSuccess || false}
                reference={reference}
                finalAmount={finalAmount}
                bookingDetails={bookingDetails}
                bookingId={bookingId}
                verificationMessage={verification.success ? undefined : 'Payment verification failed'}
            />
        </div>
    );
}
