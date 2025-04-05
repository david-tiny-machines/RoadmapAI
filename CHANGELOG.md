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
- Multiple GoTrueClient instances warning in console
- Inconsistent error handling patterns across components
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
- Initiative date range calculation in `utils/capacityUtils.ts` may fail if `monthlyCapacities` has fewer than three entries
- Type safety issue in `CapacityChart.tsx` where `CapacityWarning` component uses `any[]` type instead of proper `MonthlyEffort` interface
- Initiative list state in `InitiativeList.tsx` may become out of sync with parent's initiatives prop due to missing dependency array
- Bulk update feature in `CapacityManager.tsx` lacks validation for negative numbers and invalid inputs
- Date format mismatch between application and database:
  - App uses string format ('YYYY-MM') while Supabase uses DATE type
  - Affects all date fields in initiatives and capacity management
  - Risk of data inconsistency and comparison issues
  - Requires standardization to use proper DATE types internally while maintaining month/year-only UI
  - Note: Fixed for metrics, still needed for other components
- Timezone handling issues in date-related components:
  - `CapacityManager.tsx` uses toISOString() for dates which may cause timezone shifts
  - `InitiativeForm.tsx` month selection may be affected by timezone conversion
  - These components need the same date handling fix applied to MetricInput
  - Impact: Dates might shift by one day depending on user's timezone
  - Workaround: Use explicit YYYY-MM-DD string format instead of toISOString()
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
- Missing database constraints for initiative fields:
  - `confidence` should be limited to 0-100
  - `effort_estimate` should be positive
- Inconsistent timestamp handling between database and application:
  - Database uses TIMESTAMPTZ while application uses string types
  - No standardized approach to timezone handling across components
  - Risk of timestamp-related bugs in date comparisons and sorting
- Generic error handling doesn't provide specific feedback for different error types
- Admin-only metrics functionality exists in database but admin interface is planned for Phase 6
- Database constraint forces metric values to be ≥ 0, which may not support negative interest rates in the future
- Multiple Supabase GoTrueClient instances detected in browser console:
  - Console warnings indicate authentication client is initialized multiple times
  - May lead to inefficient resource usage and potential race conditions
  - Should be refactored to use a single, application-wide authentication client
- NaN warning in MetricInput component:
  - Console warning "Received NaN for the 'value' attribute" when deleting the value in the input field
  - Issue caused by parseFloat() on empty string returning NaN in onChange handler
  - Form validation works but creates console warnings
  - Should handle empty string case before parsing to number
- Inconsistent error handling patterns across components:
  - Initiatives use modal dialogs for errors and confirmations
  - Metrics use inline error messages
  - Auth pages use inline error messages
  - Form components use inline validation errors
  - Not a functional issue, but creates inconsistent UX

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