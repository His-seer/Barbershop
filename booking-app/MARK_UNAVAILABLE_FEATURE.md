# Mark Unavailable - Feature Implementation

## ✅ NOW IMPLEMENTED

The "Mark Unavailable" emergency feature is now fully functional.

## What It Does

When a staff member clicks "Mark Unavailable" and confirms:

1. **Creates Time-Off Record** - Inserts into `staff_time_off` table for the selected date
2. **Cancels Existing Bookings** - Finds all confirmed/pending bookings for that day and cancels them
3. **Updates Cancellation Reason** - Sets `cancellation_reason` to "Staff unavailable: [reason]"
4. **Shows Confirmation** - Displays how many bookings were affected
5. **Refreshes Dashboard** - Updates the view to reflect changes

## User Flow

### Staff Dashboard:
1. Click "**Mark Unavailable**" button (red button with ⚠️ icon)
2. Emergency modal appears
3. Select reason:
   - Feeling Unwell / Sick
   - Family Emergency
   - Equipment Failure
   - Other Personal Reason
4. Click "**Confirm & Block Schedule**"
5. Button shows "Processing..." while working
6. Confirmation alert shows:
   - Date blocked
   - Reason
   - Number of bookings cancelled
7. Dashboard refreshes automatically

## Database Schema Used

### `staff_time_off` table:
```sql
CREATE TABLE staff_time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Files Modified

1. **`src/actions/time-off.ts`** (NEW)
   - Server action to handle unavailability logic
   - Creates time-off record
   - Cancels bookings
   - Returns success with count

2. **`src/components/staff/DashboardHeader.tsx`**
   - Added import for `markStaffUnavailable`
   - Added `isSubmitting` state
   - Updated button handler to call real action
   - Added loading state and error handling

## Future Enhancements

- [ ] Send email/SMS notifications to affected customers
- [ ] Allow viewing/managing time-off history
- [ ] Allow blocking multiple days at once
- [ ] Admin override to remove emergency blocks
- [ ] Show unavailable dates in calendar view

## Testing Checklist

- [x] Can open "Mark Unavailable" modal
- [x] Can select different reasons
- [x] Button shows loading state
- [x] Creates time-off record in database
- [x] Cancels existing bookings
- [x] Shows correct count of cancelled bookings
- [x] Dashboard refreshes after blocking
- [x] Error handling works if action fails
