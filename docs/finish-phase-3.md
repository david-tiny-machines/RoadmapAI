# Completing Phase 3: Forecasting Engine & Data Infrastructure

## Current Status (v0.0.3a)
✅ Completed:
- Basic authentication with Supabase
- User profile management
- Database schema setup
- Data persistence layer for users and initiatives

❌ Missing:
1. Historical Metrics Features
   - Upload/input interface for historical metrics
   - Storage and retrieval of metric history
   - API endpoints for metric management

2. Forecasting Engine
   - Baseline metric visualization
   - Forecast calculation logic
   - Uplift visualization against baseline

3. Business Metrics Tracking
   - Conversion rate tracking
   - Loan size tracking
   - Interest rate tracking
   - Metric history views

## Implementation Plan

### 1. Database Work
- Add indexes for metric queries
- Implement metric aggregation functions
- Set up metric type validation

### 2. Backend API
- Create metric upload endpoints
- Implement forecast calculation endpoints
- Add metric retrieval and filtering

### 3. Frontend Components
- Historical metric input form
- Metric visualization charts
- Forecast display components
- Metric management interface

### 4. Integration
- Connect forecast display to initiatives
- Link metric history to forecasts
- Implement real-time metric updates

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