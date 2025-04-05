# Completing Phase 3: Forecasting Engine & Data Infrastructure

## Current Focus (Visualization Phase - v0.0.3e)
We have completed the basic metrics functionality in v0.0.3d:
✅ MetricInput component working correctly
✅ Metrics page data loading and display
✅ Date handling between frontend and Supabase
✅ Error handling and form validation
✅ Tabbed interface for metric organization

Next focus for v0.0.3e: Implementing metric visualization
- Create MetricChart component using Recharts
- Show historical data in line chart format
- Add interactive features (tooltips, legends)
- Implement date range selection

## Current Status (v0.0.3d)
✅ Completed:
- Basic authentication with Supabase
- User profile management
- Database schema setup
- Data persistence layer
- Basic metrics infrastructure:
  - Database schema for historical_metrics
  - MetricInput component for data entry
  - Tabbed metrics page with type-specific views
  - RLS policies for data security
  - Proper date and timezone handling
  - Financial data validation

❌ Missing:
1. Historical Metrics Features
   - ✅ Upload/input interface
   - ✅ Storage and retrieval
   - ✅ Type-specific organization
   - ❌ Metric visualization (charts) <- NEXT FOCUS (v0.0.3e)
   - ❌ API endpoints for metric management

2. Forecasting Engine
   - ❌ Baseline metric visualization
   - ❌ Forecast calculation logic
   - ❌ Uplift visualization against baseline

3. Business Metrics Tracking
   - ✅ Conversion rate tracking
   - ✅ Loan size tracking
   - ✅ Interest rate tracking
   - ❌ Metric history views with charts
   - ❌ Trend analysis

## Implementation Plan

### 1. Database Work
✅ Completed:
- Add indexes for metric queries
- Set up metric type validation

❌ Still Needed:
- Implement metric aggregation functions

### 2. Backend API
✅ Completed:
- Basic Supabase integration for metrics

❌ Still Needed:
- Create metric upload endpoints
- Implement forecast calculation endpoints
- Add metric retrieval and filtering

### 3. Frontend Components
✅ Completed:
- Historical metric input form
- Basic metric management interface
- Tabbed metric type organization

❌ Still Needed:
- Metric visualization charts (v0.0.3e)
- Forecast display components
- Enhanced metric management interface

### 4. Integration
❌ Still Needed:
- Connect forecast display to initiatives
- Link metric history to forecasts
- Implement real-time metric updates

## Revised Implementation Order

1. **Metric Visualization (v0.0.3e - Current Focus)**
   - Create MetricChart component using Recharts
   - Implement proper date handling per fix-date.md
   - Add type selection and date range controls
   - Add interactive tooltips and legends

   **Metrics improvements needed:**
   - Add date range filtering
   - Implement chart-specific number formatting
   - Add loading states for chart data
   - Handle empty/sparse data gracefully

2. **Forecasting Foundation**
   - Create ForecastDisplay component
   - Implement basic forecast calculations
   - Add initiative impact visualization

3. **API and Data Layer**
   - Add metric aggregation functions
   - Create forecast calculation endpoints
   - Implement metric filtering and retrieval

4. **Integration and Polish**
   - Connect forecasts to initiatives
   - Add real-time updates
   - Enhance UI/UX

## One-Shot Prompt

```
Implement the forecasting engine and historical metrics tracking for RoadmapAI Phase 3. This should include:

1. Create components/metrics/MetricInput.tsx:
- Form for inputting historical metrics (conversion, loan size, interest rate)
- Date selection
- Validation
- Supabase integration

2. Create components/metrics/MetricChart.tsx:
- Line chart showing historical metrics
- Forecast overlay
- Interactive tooltips
- Legend and controls

3. Create components/forecasting/ForecastDisplay.tsx:
- Combined view of baseline and projected metrics
- Initiative impact visualization
- Cumulative uplift calculation
- Date range controls

4. Create pages/api/metrics/[...].ts endpoints:
- POST /api/metrics/upload for batch metric upload
- GET /api/metrics/history for retrieving metric history
- GET /api/metrics/forecast for calculating forecasts

5. Create pages/metrics/index.tsx:
- Metric management dashboard
- Upload interface
- Historical view
- Forecast view

6. Update schema.sql:
- Add indexes for metric queries
- Add metric aggregation functions
- Add metric validation constraints

7. Add utility functions in utils/metrics.ts:
- Forecast calculation
- Metric aggregation
- Date handling
- Data validation

Use:
- Recharts for visualizations
- Supabase for data storage
- React Query for data fetching
- Date-fns for date handling
- Zod for validation

Follow existing patterns:
- TailwindCSS for styling
- TypeScript for type safety
- React hooks for state
- Next.js API routes
```

## Success Criteria
- Historical metrics can be uploaded and viewed
- Forecasts are calculated and displayed
- Business metrics are tracked and visualized
- Data is properly persisted in Supabase
- UI is consistent with existing design
- All features are properly typed and validated

## Next Steps After Completion
1. Test with sample historical data
2. Verify forecast calculations
3. Document metric upload format
4. Create user guide for metric management
5. Plan transition to Phase 4 