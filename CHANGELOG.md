# Changelog

All notable changes to the RoadmapAI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Version Numbering System

We use a custom version numbering system: v0.0.Xa

### Structure
v[MAJOR].[PRD].[PHASE][ITERATION]

### Components
- MAJOR (0): Indicates pre-1.0 software
- PRD (0): Indicates progress towards PRD completion
  - 0: PRD requirements not fully met
  - 1: All PRD requirements met
- PHASE (1-6): Corresponds to the phase number from the PRD
  - 1: Input & Visual Validation
  - 2: Optimisation & Prioritisation
  - 3: Forecasting Engine & Data Infrastructure
  - 4: Scenario & Goal Planning
  - 5: Timeline & Capacity Visualisation
  - 6: Admin Interface
- ITERATION (a,b,c...): Sequential updates within a phase

### Examples
- v0.0.1a: First iteration of Phase 1, PRD not complete
- v0.0.2b: Second iteration of Phase 2, PRD not complete
- v0.1.3a: First iteration of Phase 3, PRD complete
- v1.0.0: First major release

## [Unreleased]

## [v0.0.4a] - 2025-04-06
### Added
- Created SQL seed script (`db/seeds/01_test_data.sql`) to populate `historical_metrics`, `monthly_capacity`, and `initiatives` with test data, including date constraints.
- Implemented scheduling utility (`utils/schedulingUtils.ts`) with `calculateRoadmapSchedule` function.
  - Sorts initiatives by mandatory status, then priority score.
  - Allocates effort against monthly capacity.
  - Calculates `roadmap_delivery_month` for each initiative.
  - Respects `start_month` as earliest allocation constraint.
  - Adds `deadline_missed` flag based on `end_month` target.
  - Returns initiatives in the calculated schedule order.
- Added database check constraint `valid_date_range` to `initiatives` table (`start_month` IS NULL OR `end_month` IS NULL OR `end_month` >= `start_month`).
- Added validation (`min="0"`, `max="100"`) to "Uplift (%)" input in `InitiativeForm.tsx`.
- Created test page (`pages/dev/test-schedule.tsx`) to display scheduler output.

### Changed
- Updated `db/schema.sql` to include the `valid_date_range` constraint.
- Clarified that `uplift` in `initiatives` table represents a percentage (0-100).
- Updated seed script `priority_score` calculations to align with `calculatePriorityScore` utility function.
- Updated `v0.0.4a-plan.md` and `phase-4-high-level-plan.md` to reflect detailed scheduling logic and test results.

### Fixed
- Corrected database constraint `valid_date_range` logic to allow NULL start/end dates.
- Fixed incorrect initial `priority_score` calculation in seed script.
- Fixed `calculateRoadmapSchedule` return value to preserve scheduling order.
- Fixed various import path errors (`@/` alias issues).

### Deprecated

### Removed

### Fixed

### Security

### Known Issues
- Forecasting logic (v0.0.4d) needs revision to handle `uplift` consistently as a percentage.

## [v0.0.3j] - 2025-04-06
### Added
- Added Supabase tables (`scenarios`, `scenario_initiatives`), RLS policies, and triggers via SQL Editor to support Phase 4 Scenario Planning.
- Updated `db/schema.sql` to include definitions for `scenarios` and `scenario_initiatives` tables.

### Changed
- Regenerated Supabase TypeScript types (`types/supabase.ts`) via CLI to include new Phase 4 tables (`scenarios`, `scenario_initiatives`).

### Other
- Conducted Phase 3 stability review: Verified data consistency for Initiatives (UUIDs, `user_id`, persisted `priority_score`, `YYYY-MM-DD` dates) and Capacity (`YYYY-MM-DD` dates) against `v0.0.3a` known issues; confirmed prior fixes are effective.

## [v0.0.3i] - 2025-04-06
### Added
- Added database constraint `confidence_range` (0-100) to `initiatives` table.
- Added "Metrics" link to main application navigation header.

### Changed
- Refactored Supabase client usage across multiple components (`AuthProvider`, `InitiativeList`, `InitiativeForm`, `MetricInput`, `MetricsPage`, `CapacityManager`) to consistently use `useSupabaseClient` / `useSessionContext` hooks, removing direct client imports/creations.
- Updated `calculateMonthlyEffort` in `capacityUtils.ts` to correctly handle default end dates (use last month of capacity window) and normalize date comparisons, ensuring effort calculation covers the full display period.
- Standardized display of asynchronous operation errors using a shared `ErrorDisplay` component across Initiatives, Metrics, Capacity, and Auth pages.
- Set `REPLICA IDENTITY FULL` for `initiatives` table in Supabase database.

### Fixed
- Capacity chart not displaying initiative effort due to missing data fetch in `pages/capacity/index.tsx`.
- Runtime error on Metrics page (`Cannot convert undefined or null to object`) caused by missing `METRIC_TYPE_DISPLAY` mapping.
- "Multiple GoTrueClient instances detected" console warning.
- Console warning "Received NaN for the 'value' attribute" when clearing the value field in `MetricInput`.
- Real-time UI updates not occurring after deleting an initiative due to missing Supabase replication for DELETE events.
- Type mismatch for `historical_metrics.id` (expected `string`, was `number`) in `HistoricalMetric` interface.
- Type mismatch for `historical_metrics.type` (`average_loan_size` vs `loan_size`) during Supabase insert.
- Missing `priority_score` field in `DbInitiativeType` interface definition.
- Corrected various import paths and type definitions related to the above fixes.

### Known Issues (New)
- Chart.js console warning: "Tried to use the 'fill' option without the 'Filler' plugin enabled..." appears on metrics forecast view. Requires investigation into Recharts/Chart.js plugin registration.

## [v0.0.3h] - 2025-04-05
### Added
- Created Supabase table `monthly_capacity` to store user-specific available working days per month.
- Implemented Row Level Security (RLS) policies for `monthly_capacity` (Users manage their own).
- Added database constraints (`positive_capacity`, `unique_user_month_capacity`) and index for `monthly_capacity`.
- Added `DbCapacityType` interface and `toDbCapacity`/`fromDbCapacity` conversion utilities.
- Implemented loading spinner and error display (`ErrorDisplay` component) in `CapacityManager`.
- Integrated Supabase type generation (`types/supabase.ts`) via CLI.
- Correctly configured `SessionContextProvider` in `_app.tsx` to provide the Supabase client.

### Changed
- Refactored `CapacityManager` component to fetch/save data from Supabase `monthly_capacity` table.
- Updated `CapacityManager` state logic for asynchronous Supabase operations (fetch, upsert).
- Standardized date handling in `CapacityManager` to use `YYYY-MM-01` format for database interaction, preventing timezone issues.
- Added browser-level input validation (`min="0"`) for capacity values.

### Fixed
- Resolved "supabase.from is not a function" error by implementing `SessionContextProvider` in `_app.tsx`.
- Addressed various Supabase CLI execution issues within the Replit environment (installation methods, `npx` usage, login/auth flow).

### Removed
- Removed local storage (`roadmapai_capacity`) usage for storing capacity data.
- Removed redundant top-level `id` and `updatedAt` fields from the frontend `CapacityData` type.

### Known Issues
- *Removed resolved issue: Capacity chart not displaying initiative effort.*

## [v0.0.3g] - 2025-04-05
### Added
- Migrated initiative data storage from local storage to Supabase `initiatives` table.
- Added `user_id` foreign key relationship to initiatives.
- Implemented Row Level Security (RLS) policies for initiatives (Users can manage their own).
- Added database constraints (`confidence_range`, `effort_positive`, `valid_dates`).
- Created `value_lever` ENUM type in database and updated table schema.

### Changed
- Updated `InitiativeList` to fetch, display, and sort initiatives from Supabase.
- Implemented real-time updates in `InitiativeList` using Supabase subscriptions.
- Updated `InitiativeForm` to save and update initiatives directly in Supabase.
- Corrected `DbValueLever` type and `VALUE_LEVER_DISPLAY` mapping in `types/database.ts` to match actual requirements (removed cost_reduction, compliance_risk).

### Fixed
- Resolved date handling issues in `InitiativeForm`:
  - Standardized date storage as `YYYY-MM-DD` (first day of month) using UTC methods to prevent timezone shifts.
  - Corrected bug where editing initiatives without changing dates cleared existing dates.
- Ensured `effort_estimate` is saved as an integer.
- Allowed negative values to be entered and saved for the `uplift` field.
- Resolved `NaN` warnings for number inputs in `InitiativeForm`.
- Addressed database schema mismatch by creating `value_lever` ENUM type and altering column type via direct SQL.

### Removed
- Removed local storage usage for storing initiative data.

## [v0.0.3f]
### Added
- Forecasting capabilities for historical metrics:
  - Linear regression-based trend calculation
  - Forecast projection for 3M, 6M, or 1Y periods
  - Confidence interval bands with toggle
  - Visual distinction between historical and projected data
  - Automatic date range handling (3 months historical + forecast period)

### Changed
- Enhanced metric visualization:
  - Dedicated forecast view alongside table and chart views
  - Line-style legend indicators for better visualization
  - Proper scaling and formatting maintained for each metric type
  - Historical data limited to 3 months in forecast view for clarity

### Technical
- New components:
  - `ForecastDisplay.tsx` for forecast visualization
  - `ForecastControls.tsx` for forecast period and confidence band controls
  - `forecastUtils.ts` for trend calculation and projection
- Updated existing components:
  - Modified `metrics/index.tsx` to handle forecast view
  - Enhanced date handling for future projections
- Verified through comprehensive test plan:
  - Test 1.1-1.2: Basic forecast rendering and controls
  - Test 2.1-2.2: Trend calculation and edge cases
  - Test 3.1: View mode integration

### Known Limitations
- Single forecasting model (linear regression only)
- No manual adjustment of forecasted values
- No seasonal adjustments
- No initiative impact integration
- No forecast data persistence

## [v0.0.3e]
### Added
- Chart visualization for historical metrics:
  - Line charts for each metric type with proper formatting
  - Interactive tooltips showing exact values
  - Date range selection with preset options (3M, 6M, 1Y, All)
  - Custom date range selection
  - Toggle controls for data points and grid lines
  - View switching between table and chart formats

### Changed
- Enhanced metric display:
  - Y-axis formatting specific to each metric type:
    - Conversion and Interest Rate shown as percentages
    - Average Loan Size shown in currency format
  - X-axis shows months in MMM YYYY format
  - Chart automatically adjusts scale based on date range
  - Settings persist when switching between views

### Technical
- New components:
  - `MetricChart.tsx` for line chart visualization
  - `DateRangeSelector.tsx` for date range controls
  - `ChartControls.tsx` for visualization options
- Updated existing components:
  - Enhanced `MetricTable.tsx` with view switching
  - Modified `metrics/index.tsx` to handle chart state
- Verified through comprehensive test plan:
  - Test 1.1-1.2: Chart rendering and tooltips
  - Test 2.1-2.2: Date range selection
  - Test 3.1-3.2: Chart controls
  - Test 4.1: View integration

### Known Limitations
- Y-axis scale is fixed for each metric type
- No ability to zoom into specific regions
- Cannot compare multiple metrics on same chart
- Limited to monthly data points
- No data export functionality

## [v0.0.3d]
### Added
- Complete historical metrics functionality:
  - Metric input interface with validation
  - Proper date handling and timezone fixes
  - Database storage with Supabase integration
  - Type-safe metric management
  - Tabbed interface for metric organization

### Changed
- Enhanced metric data handling:
  - Standardized date storage as first day of month
  - Improved timezone handling to prevent date shifting
  - Implemented proper financial data validation
  - Added user-friendly error messages
  - Optimized table display with metric-specific views

### Fixed
- Date handling issues in metric storage:
  - Resolved timezone conversion problems
  - Standardized date format between UI and database
  - Fixed month selection logic
- Duplicate entry handling:
  - Added proper error messages for unique constraint violations
  - Maintained form state on submission errors
- Value validation:
  - Enforced appropriate decimal precision for each metric type
  - Added helpful validation messages for invalid inputs

### Technical
- New components:
  - `MetricTabs.tsx` for metric type filtering
  - `MetricTable.tsx` for type-specific displays
- Updated `metrics/index.tsx` with new component architecture
- Enhanced database integration:
  - Proper handling of DATE types
  - Consistent timezone handling
  - Unique constraint enforcement
- Verified through comprehensive test plan:
  - Test 3.1-3.2: Fixed month selection and storage
  - Test 4.1: Proper duplicate handling
  - Test 5.1: Enhanced sorting and organization
  - Test 5.2: Improved financial data validation

### Known Issues
- Some components still need timezone handling fixes (inherited from v0.0.3c)

## [v0.0.3c]
### Fixed
- Backported fix from Phase 2: Initiative drag and drop prioritization now correctly maintains mandatory-before-optional ordering
- Prevented mandatory initiatives from being moved below optional initiatives in priority list

### Technical
- Enhanced `handleDragEnd` function in InitiativeList component to enforce ordering constraints

## [v0.0.3b] [REVERTED]
### Note
- Experimental version attempting to implement the full Phase 3 one-shot prompt from finish-phase-3.md
- Attempted implementation of MetricInput, MetricChart, and ForecastDisplay components
- Rolled back due to integration issues between forecast calculations and initiative data
- Decision made to implement Phase 3 features incrementally instead of all at once

## [Unreleased - v0.0.3a]
### Added
- Basic Supabase authentication integration
  - Sign in/sign up pages
  - User session management
  - Protected routes with middleware
- User profile management with RLS policies
- Database schema setup for:
  - User profiles
  - Initiatives
  - Historical metrics
- Auth context for state management
- Test page for authentication verification
- Technical debt tracking in docs/technical-debt.md
  - Added testing infrastructure proposal
  - Documented type system improvements

### Changed
- Migrated from local storage to Supabase database
- Updated MainLayout to handle auth state
- Enhanced error handling in auth flows
- Aligned metric type ENUMs with database conventions
  - Updated from Title Case to snake_case
  - Added type-safe conversion between display and storage formats
  - Fixed mismatch between frontend and database types

### Technical
- Added Supabase client configuration
- Implemented RLS policies for data security
- Added TypeScript types for auth context
- Added database type definitions and conversion utilities
- Updated components to handle database/display type conversion

### Known Issues
- Bulk update feature in `CapacityManager.tsx` lacks validation for negative numbers and invalid inputs
- Date format mismatch between application and database:
  - App uses string format ('YYYY-MM') while Supabase uses DATE type
  - Affects all date fields in initiatives and capacity management
  - Risk of data inconsistency and comparison issues
  - Requires standardization to use proper DATE types internally while maintaining month/year-only UI
  - Note: Fixed for metrics, still needed for other components
- Schema/implementation mismatch for initiatives:
  - Current schema.sql defines initiatives table with UUID keys, user_id foreign keys, and database-computed priority scores
  - Current implementation uses local storage with string IDs, no user association, and client-computed scores
  - This mismatch will require data migration and code updates in Phase 4:
    - Generate UUIDs for existing initiatives
    - Associate initiatives with user accounts
    - Migrate priority score computation to database
    - Update frontend to handle database IDs and user associations
- Priority score calculation in `prioritizationUtils.ts` is not persisted, leading to potential inconsistencies when initiatives are reloaded
- Value lever and metric type overlap:
  - While display/database conversion is now handled, architectural decision needed on shared business logic
  - Consider unifying calculation and validation logic for shared metrics/levers
- Missing database constraints for initiative fields (`effort_estimate` should be positive).
- Inconsistent timestamp handling between database and application:
  - Database uses TIMESTAMPTZ while application uses string types
  - No standardized approach to timezone handling across components
  - Risk of timestamp-related bugs in date comparisons and sorting
- Generic error handling doesn't provide specific feedback for different error types
- Admin-only metrics functionality exists in database but admin interface is planned for Phase 6
- Database constraint forces metric values to be ≥ 0, which may not support negative interest rates in the future

## [v0.0.2b]
### Fixed
- Initiative drag and drop prioritization now correctly maintains mandatory-before-optional ordering
- Prevented mandatory initiatives from being moved below optional initiatives
- Ensured drag and drop behavior aligns with priority rules from PRD

### Technical
- Enhanced `handleDragEnd` function in InitiativeList component to enforce ordering constraints
- Added validation check for mandatory-to-optional initiative moves

## [v0.0.2a]
### Added
- Initiative list view with priority display
- Priority score calculation based on impact and confidence
- Basic initiative management:
  - Create new initiatives
  - Edit existing initiatives
  - Delete initiatives with confirmation
- Mandatory vs optional initiative handling
- Date range support for initiatives

### Changed
- Enhanced initiative card layout
- Improved data structure for initiatives
- Updated priority calculation logic

## [v0.0.1a]
### Added
- Basic project structure and configuration
- Core UI components:
  - Layout system
  - Navigation header
  - Basic forms
- Initial routing setup
- Development environment configuration

### Technical
- Next.js project setup
- TypeScript configuration
- Tailwind CSS integration
- Basic component architecture 