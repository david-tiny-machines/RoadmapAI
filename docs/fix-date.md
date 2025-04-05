# Date Format Standardization Plan

## Implementation Progress

**Completed:**
- ✅ Metrics components now use Date objects internally (Step 1 completed for metrics)
- ✅ Added date utility functions in dateUtils.ts:
  - fromMonthString: Converts YYYY-MM to Date
  - formatMonthYearFromDate: Formats Date to user-friendly string
- ✅ Updated MetricInput and metrics page to use proper Date objects
- ✅ Fixed display of previous months only for historical metrics

**Pending:**
- ❌ Capacity components still use string dates
- ❌ Initiative components still use string dates
- ❌ Utility functions for all date conversions not yet complete

## Current State
The application currently uses string format 'YYYY-MM' for dates across various components, while the Supabase database uses the PostgreSQL DATE type. This mismatch needs to be resolved by updating the application to use proper DATE types.

## Important UI Requirements
- The UI MUST continue to show only month and year selection (e.g., "Apr 2024")
- No day-level date picker should be shown to users
- Users should only be able to select at the month/year granularity
- The internal Date object will store the first day of each month (e.g., "2024-04-01") but this is never exposed to users

## Data Migration Requirements

### Storage Debug Tool
The application includes a storage debug tool (`pages/dev/storage-debug.tsx`) that can clear existing localStorage data. Since we're still in development:

1. **Recommended Approach**: Clear all data before implementing date changes
   ```typescript
   // Using the storage debug tool's clearAll function
   const clearAll = () => {
     clearInitiatives();
     clearCapacity();
   };
   ```

2. **Alternative Approach** (if needed): Migrate existing data
   - Would require adding migration functions to convert YYYY-MM strings to Date objects
   - More complex and potentially error-prone
   - Not recommended during development phase

### Steps Before Implementation
1. Navigate to the storage debug page
2. Use the "Clear All Data" button to remove existing localStorage data
3. Proceed with date format changes
4. Test with fresh data entry

## Files Requiring Updates

### 1. Type Definitions

#### types/capacity.ts
```typescript
// Current
export interface MonthlyCapacity {
  month: string; // YYYY-MM format
  availableDays: number;
}

// Proposed
export interface MonthlyCapacity {
  month: Date; // Will store first day of month, but UI only shows month/year
  availableDays: number;
}
```

#### types/metrics.ts
```typescript
// Current
export interface HistoricalMetric {
  month: string; // YYYY-MM format
  // ...other fields
}

export interface MetricInput {
  month: string;
  // ...other fields
}

// Proposed
export interface HistoricalMetric {
  month: Date; // Will store first day of month, but UI only shows month/year
  // ...other fields
}

export interface MetricInput {
  month: Date; // Will store first day of month, but UI only shows month/year
  // ...other fields
}
```

#### types/initiative.ts
```typescript
// Current
export interface Initiative {
  startMonth?: string;
  endMonth?: string;
  // ...other fields
}

// Proposed
export interface Initiative {
  startMonth?: Date; // Will store first day of month, but UI only shows month/year
  endMonth?: Date; // Will store first day of month, but UI only shows month/year
  // ...other fields
}
```

### 2. Utility Functions

#### utils/dateUtils.ts
```typescript
// Current
export function getNextNMonths(n: number, startDate: Date = new Date()): string[] {
  // Returns array of strings in YYYY-MM format
}

export function formatMonthYear(dateStr: string): string {
  // Formats YYYY-MM string to "MMM YYYY"
}

// Proposed
export function getNextNMonths(n: number, startDate: Date = new Date()): Date[] {
  // Should return array of Date objects (first day of each month)
}

export function formatMonthYear(date: Date): string {
  // Should format Date object to "MMM YYYY" for display
}

// New helper functions needed
export function startOfMonth(date: Date): Date {
  // Returns new Date set to first day of month
  // Used internally, never exposed to UI
}

export function toMonthString(date: Date): string {
  // Converts Date to YYYY-MM format for display/debugging
  // Used for data inspection, not regular UI display
}

export function fromMonthString(monthStr: string): Date {
  // Converts YYYY-MM string to Date object (first day of month)
  // Used for data migration and API boundaries
}

export function createMonthDate(year: number, month: number): Date {
  // Creates a Date object for the first day of the specified month
  // Used when converting UI month/year selection to Date
}
```

### 3. Components

#### components/capacity/CapacityManager.tsx
- Update state management to use Date objects internally
- MAINTAIN existing month/year selection UI
- Update handleCapacityChange to work with Date objects while preserving the month/year picker interface
- Update localStorage serialization/deserialization to handle Date objects

#### components/capacity/CapacityChart.tsx
- Update chart data handling to use Date objects internally
- MAINTAIN existing month/year display format in the chart
- Update XAxis tickFormatter to continue showing only month/year
- Update CapacityWarning component to maintain month/year format

### 4. Utilities

#### utils/capacityUtils.ts
```typescript
// Current
interface MonthlyEffort {
  month: string;
  // ...other fields
}

// Proposed
interface MonthlyEffort {
  month: Date; // Will store first day of month internally
  // ...other fields
}
```
- Update calculateMonthlyEffort function to work with Date objects
- Update date comparison logic to use native Date methods
- Ensure all date displays maintain month/year format

## Implementation Strategy

1. **Phase 1: Type Updates**
   - Update all TypeScript interfaces to use Date instead of string
   - Add new date utility functions
   - This will surface all places that need to be updated through TypeScript errors
   - Document clearly that Date objects store first day of month

2. **Phase 2: Utility Functions**
   - Update dateUtils.ts with new Date-based functions
   - Add conversion functions for backward compatibility during transition
   - Ensure all UI-facing functions maintain month/year format

3. **Phase 3: Component Updates**
   - Update components to use new Date types internally
   - PRESERVE all existing month/year selection UI
   - Update localStorage handling to properly serialize/deserialize dates
   - Ensure no day-level granularity is exposed in the UI

4. **Phase 4: Testing**
   - Test date handling across components
   - Verify proper date comparisons and sorting
   - Ensure proper integration with Supabase DATE type
   - Verify UI maintains month/year only display
   - Test that no day-level selection is possible

## Benefits

1. **Type Safety**
   - Native Date object validation
   - Proper date comparison operations
   - TypeScript type checking for date operations
   - Consistent first-day-of-month standard internally

2. **Database Compatibility**
   - Direct compatibility with Supabase DATE type
   - No need for string-date conversions at database layer
   - Consistent date handling across stack

3. **Improved Functionality**
   - Better date manipulation capabilities
   - More reliable date comparisons
   - Proper timezone handling
   - Maintains simple month/year UI

4. **Maintainability**
   - Consistent date handling across the application
   - Reduced risk of date-related bugs
   - Easier to add new date-related features
   - Clear separation between internal date handling and UI display

## Migration Notes

- All date conversions should happen at the edges of the system (UI input/output and API boundaries)
- Existing data in localStorage will need to be migrated
- Consider adding validation to ensure all dates are properly formatted
- Add error handling for invalid date strings during the transition period
- MAINTAIN all month/year picker UI components
- Ensure no day-level granularity is exposed to users 