# Feedback Widget Integration

## Overview

The Noir Hair Studios app now includes a feedback widget that allows users to submit feedback, report bugs, request features, and ask questions.

## Configuration

The feedback widget is configured with:

- **Project ID**: `0bQchrHhg3OHZ6ORkSYF`
- **Theme**: Dark (matches app theme)
- **Position**: Bottom-right corner
- **Primary Color**: Gold (#EAB308) - matches brand colors
- **Categories**: 
  - General
  - Bug
  - Feature
  - Improvement
  - Question

## Implementation

### Files Created/Modified

1. **`src/components/FeedbackWidget.tsx`** - Client component that loads the feedback widget
2. **`src/app/layout.tsx`** - Root layout updated to include the widget on all pages

### How It Works

The widget is loaded on all pages of the application and appears as a floating button in the bottom-right corner. When clicked, it opens a feedback form where users can:

1. Select a category
2. Enter their feedback
3. Optionally provide contact information
4. Submit the feedback

## Customization

### Change Theme

Edit `src/components/FeedbackWidget.tsx`:

```typescript
theme: "light", // or "dark"
```

### Change Position

```typescript
position: "bottom-left", // or "bottom-right", "top-left", "top-right"
```

### Change Primary Color

```typescript
primaryColor: "#EAB308", // Any hex color
```

### Change Button Text

```typescript
buttonText: "Feedback", // Any text
```

### Pre-fill User Information

For logged-in users, you can pre-fill their information:

```typescript
// In FeedbackWidget.tsx, add to the FeedbackApp config:
userName: "User Name",
userEmail: "user@example.com",
```

## User Experience

### For Customers
- Customers can provide feedback about their booking experience
- Report issues with the booking system
- Request new features or services
- Ask questions about the barbershop

### For Staff
- Staff can report technical issues
- Suggest improvements to the dashboard
- Request new features for appointment management

### For Admins
- Admins can report bugs in the admin panel
- Request analytics features
- Provide feedback on the overall system

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Look for the feedback button in the bottom-right corner

4. Click it and test the feedback form

### Production Testing

The widget is automatically included in production builds and will appear on:
- https://noirhairstudios.vercel.app

## Monitoring Feedback

Feedback submissions are sent to the project dashboard at:
- Project ID: `0bQchrHhg3OHZ6ORkSYF`

Check with your feedback platform provider for access to the dashboard where you can:
- View all feedback submissions
- Categorize and prioritize feedback
- Respond to users
- Track feature requests and bugs

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify the script is loading:
   ```
   https://develop.d9chi2hq3bkdj.amplifyapp.com/widget.iife.js
   ```
3. Check that FeedbackWidget component is imported in layout.tsx

### Widget Styling Issues

1. Verify the CSS is loading:
   ```
   https://develop.d9chi2hq3bkdj.amplifyapp.com/widget.css
   ```
2. Check for CSS conflicts with your app styles
3. Try adjusting the z-index if the widget is hidden behind other elements

### Widget Not Submitting

1. Check network tab for failed requests
2. Verify project ID is correct
3. Check feedback platform status

## Future Enhancements

### Planned Features

1. **Auto-populate user info** - For logged-in users (staff/admin)
2. **Screenshot capability** - Allow users to attach screenshots
3. **Custom categories** - Add barbershop-specific categories:
   - Service Quality
   - Booking Experience
   - Staff Interaction
   - Facility Feedback

### Integration Ideas

1. **Link to bookings** - Associate feedback with specific appointments
2. **Staff notifications** - Alert staff when feedback is received
3. **Analytics** - Track feedback trends over time
4. **Response system** - Allow staff to respond to feedback

## Notes

- The widget loads asynchronously (`lazyOnload`) to not impact page performance
- It's a client component (`'use client'`) as it requires browser APIs
- The widget is globally available on all pages
- Dark theme and gold color match the Noir Hair Studios brand

## Support

For issues with the feedback widget itself, contact the widget provider.

For integration issues, check:
1. `src/components/FeedbackWidget.tsx`
2. `src/app/layout.tsx`
3. Browser console for errors
