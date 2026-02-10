# Staff Overtime & Bonus Rewards System

## Overview
The Staff Dashboard now includes a comprehensive **Overtime & Bonus Rewards** system that motivates staff members to exceed their daily targets with tangible financial incentives.

## Features

### 1. **Dynamic Goal Indicator** 🎯
- The progress bar at the top changes from **gold to green** when the daily goal (GHS 500) is reached
- Visual celebration effect with enhanced glow when goal is achieved
- Real-time progress tracking with smooth animations

### 2. **Overtime Calculation** 💰
When a staff member reaches their daily goal:
- **Overtime** = Total Earnings - Daily Target
- Displayed in the earnings card with a green highlight
- Example: If target is GHS 500 and earnings are GHS 550, overtime is GHS 50

### 3. **Tiered Bonus Multipliers** 🏆

The system rewards exceptional performance with bonus multipliers:

| Tier | Achievement | Bonus Rate | Badge | Card Color |
|------|-------------|-----------|-------|------------|
| **Champion** 💪 | 110% of target (GHS 550) | +10% | Green badge | Green gradient |
| **Elite** ⭐ | 125% of target (GHS 625) | +15% | Cyan badge | Blue-cyan gradient |
| **Legendary** 🔥 | 150% of target (GHS 750) | +20% | Purple badge | Purple-pink gradient |

**How it works:**
- Bonus is calculated on the **overtime amount only**
- Example: If earnings are GHS 625 (125% of GHS 500 target)
  - Overtime: GHS 125
  - Bonus (15%): GHS 18.75
  - Total with Bonus: GHS 643.75

### 4. **Earnings Card Enhancements** 💎

The earnings card now displays:
- **Base Earnings**: Original completed bookings total
- **Overtime**: Amount beyond the daily target (if goal reached)
- **Bonus**: Percentage-based reward on overtime (if tier unlocked)
- **Total with Bonus**: Final earnings including all bonuses
- **Dynamic styling**: Card color changes based on performance tier

### 5. **Bonus Rewards Tracker** 🎯

A new tracker card appears when the goal is reached, showing:
- Current achievement tier
- Progress to the next tier
- How much more to earn for the next bonus level
- Complete list of all reward tiers
- Visual progress bar with tier-appropriate colors

## User Experience

### Before Goal (< GHS 500)
- Gold progress bar
- Standard earnings card with gold accent
- Shows how much more needed to reach target
- "X more to reach target" message

### Goal Reached (≥ GHS 500)
- **Green progress bar** with celebration message
- Enhanced earnings card with green border
- Shows overtime amount
- Bonus Rewards Tracker appears
- "🎉 Goal reached! Keep going!" message

### Champion Tier (≥ GHS 550)
- Green gradient earnings card
- 💪 Champion badge
- +10% bonus on overtime
- Progress bar shows path to Elite tier

### Elite Tier (≥ GHS 625)
- Blue-cyan gradient earnings card
- ⭐ Elite badge
- +15% bonus on overtime
- Progress bar shows path to Legendary tier

### Legendary Tier (≥ GHS 750)
- Purple-pink gradient earnings card
- 🔥 Legendary badge
- +20% bonus on overtime
- Celebration message: "You're an absolute legend!"

## Implementation Details

### Files Modified
1. **`DashboardHeader.tsx`**
   - Added green color transition when goal is reached
   - Enhanced progress bar with conditional styling
   - Updated celebration messages

2. **`page.tsx`** (Staff Dashboard)
   - Added overtime calculation logic
   - Implemented tiered bonus system
   - Created dynamic earnings card with bonus breakdown
   - Added Bonus Rewards Tracker component

### Calculation Logic

```typescript
// Daily target
const dailyTarget = 500;

// Overtime calculation
const goalReached = stats.earnings >= dailyTarget;
const overtime = goalReached ? stats.earnings - dailyTarget : 0;

// Bonus tier determination
if (stats.earnings >= dailyTarget * 1.5) {
    bonusMultiplier = 0.20; // Legendary
} else if (stats.earnings >= dailyTarget * 1.25) {
    bonusMultiplier = 0.15; // Elite
} else if (stats.earnings >= dailyTarget * 1.1) {
    bonusMultiplier = 0.10; // Champion
}

// Final calculations
const bonusAmount = overtime * bonusMultiplier;
const totalWithBonus = stats.earnings + bonusAmount;
```

## Benefits

### For Staff
- **Clear motivation** to exceed daily targets
- **Visual feedback** on performance
- **Transparent rewards** system
- **Gamification** encourages friendly competition
- **Immediate recognition** of achievements

### For Business
- **Increased productivity** through incentivization
- **Higher revenue** from motivated staff
- **Better performance tracking**
- **Staff retention** through reward system
- **Reduced need for management intervention**

## Examples

### Example 1: Just Met Goal
- Earnings: GHS 500
- Overtime: GHS 0
- Bonus: GHS 0
- Total: GHS 500
- Status: Goal reached (green bar) ✅

### Example 2: Champion Tier
- Earnings: GHS 600
- Overtime: GHS 100
- Bonus (10%): GHS 10
- Total: GHS 610
- Status: 💪 Champion

### Example 3: Elite Tier
- Earnings: GHS 700
- Overtime: GHS 200
- Bonus (15%): GHS 30
- Total: GHS 730
- Status: ⭐ Elite

### Example 4: Legendary Tier
- Earnings: GHS 800
- Overtime: GHS 300
- Bonus (20%): GHS 60
- Total: GHS 860
- Status: 🔥 Legendary

## Future Enhancements (Potential)

1. **Weekly/Monthly Leaderboards**
2. **Streak bonuses** for consecutive goal achievements
3. **Custom targets** per staff member
4. **Achievement badges** that persist
5. **Admin dashboard** to track bonus payouts
6. **Historical performance** charts
7. **Seasonal multiplier events**
8. **Team-based challenges**

## Configuration

To adjust the bonus system, modify these values in `page.tsx`:

```typescript
const dailyTarget = 500; // Base daily target

// Tier thresholds
const championThreshold = dailyTarget * 1.1;  // GHS 550
const eliteThreshold = dailyTarget * 1.25;    // GHS 625
const legendaryThreshold = dailyTarget * 1.5; // GHS 750

// Bonus rates
const championBonus = 0.10;   // 10%
const eliteBonus = 0.15;      // 15%
const legendaryBonus = 0.20;  // 20%
```

---

**Built with:** React, TypeScript, Next.js, Tailwind CSS
**Designed for:** Barbershop Staff Motivation & Performance Tracking
