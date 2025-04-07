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

## [v0.0.5e] - 2025-04-08
### Added
- Implemented `/done` command in backend API (`pages/api/agents/prd-generator.ts`) to trigger PRD generation.
- Added `extractPrdData` function using a separate OpenAI call to extract structured data (JSON) from conversation history.
- Added `formatJsonToMarkdown` function to convert extracted JSON into formatted Markdown.
- Added state management (`generatedMarkdown`, `isComplete`) to frontend page (`pages/agents/prd-generator.tsx`).
- Added conditional UI rendering on frontend for displaying generated Markdown in a `textarea` and providing "Copy to Clipboard" and "Download .md File" buttons.
- Implemented copy-to-clipboard and file download logic on the frontend.
- Added session clearing in backend upon successful Markdown generation.
- Created `docs/v0.0.5e-plan.md` detailing the implementation steps.

### Changed
- Updated backend API handler to differentiate between normal conversation turns and the `/done` command, returning `{ markdown: ... }` on completion.
- Updated frontend `handleSendMessage` to check for `markdown` key in API response and update state accordingly.
- Updated `ChatInterface` to accept and use combined `isLoading || isComplete` state to disable input.
- Refined system prompt in backend API to instruct user about the `/done` command.

### Fixed
- Removed unsupported `response_format: { type: "json_object" }` parameter from OpenAI call in `extractPrdData` function for compatibility with `gpt-4` model.

## [v0.0.5d] - 2025-04-08
### Added
- Implemented in-memory session store (`Map`) in the backend API (`pages/api/agents/prd-generator.ts`) to maintain conversation history between requests (non-persistent).
- Added basic session key handling (using hardcoded key for MVP).

### Changed
- Refactored backend API route (`pages/api/agents/prd-generator.ts`):
    - To retrieve/update conversation history from the session store.
    - To expect a single `message` object in the request body.
    - Updated system prompt to explicitly guide the AI through MVP PRD sections sequentially.
    - To pass the full, updated conversation history to the OpenAI API on each turn.
    - To store the assistant's reply back into the session history.
- Updated frontend page (`pages/agents/prd-generator.tsx`) to send only the single new user message object (`{ message: ... }`) to the backend API.
- Created `docs/v0.0.5d-plan.md` detailing the implementation steps.

## [v0.0.5c] - 2025-04-08
### Added
- Implemented state management (`useState`) for messages and loading status on PRD Generator page (`pages/agents/prd-generator.tsx`).
- Added initial assistant greeting message using `useEffect` on PRD Generator page.

### Changed
- Connected frontend chat interface (`ChatInterface.tsx`) to the backend API (`/api/agents/prd-generator`).
- Implemented `handleSendMessage` function in `pages/agents/prd-generator.tsx` to:
    - Perform optimistic UI update for user messages.
    - Send message history to the backend API using `fetch`.
    - Handle successful API responses by adding assistant replies to state.
    - Handle API/network errors gracefully and update UI state.
    - Manage `isLoading` state during API calls.
- Updated `ChatInterface.tsx` to correctly use `onSendMessage` prop and respect `isLoading` state for input/button.

### Fixed
- Removed redundant `<MainLayout>` wrappers from `pages/agents/index.tsx` and `pages/agents/prd-generator.tsx` to resolve duplicate navigation header issue.
- Resolved `500 Internal Server Error` caused by missing `OPENAI_API_KEY` environment variable by ensuring it was set correctly in Replit Secrets.

## [v0.0.5b] - 2025-04-08
### Added
- Added "Agents" link to main navigation header (`components/layout/MainLayout.tsx`).
- Created Agent list page (`pages/agents/index.tsx`) with a link to the PRD Generator.
- Created PRD Generator agent page (`pages/agents/prd-generator.tsx`).
- Implemented basic, non-functional chat UI component (`components/agents/ChatInterface.tsx`) with message display area, input field, and send button (placeholder functionality).
- Created `docs/v0.0.5b-plan.md` detailing the implementation steps.

## [v0.0.5a] - 2025-04-07
### Added
- Created backend API route (`pages/api/agents/prd-generator.ts`) for the AI PRD Agent.
- Integrated basic OpenAI client (`openai` package) setup and API key handling.
- Implemented initial API logic to receive messages, call OpenAI Chat Completions API with a basic system prompt, and return the AI's response.
- Added basic error handling for API requests and OpenAI calls.
- Included placeholder comments for future session/conversation history management.
- Added `v0.0.5a-plan.md` detailing the implementation steps.

### Changed
- Updated `docs/PRD.md` build approach to reflect new Phase 5 (AI Agent), Phase 6 (Scenarios), Phase 7 (Goals/Admin).
- Created `docs/phase-5-high-level-plan.md` outlining the overall plan for the AI PRD Agent MVP.

### Technical
- Installed `openai` npm package.

### Known Issues
- API route `/api/agents/prd-generator` is protected by authentication middleware, preventing direct testing with unauthenticated tools like `curl`. Full testing requires frontend integration (`v0.0.5c`).

## [v0.0.4h] - 2025-04-06
### Changed
- **Home Page (`pages/index.tsx`)**:
    - Added navigation links for "Metrics" and "Roadmap".
    - Reordered navigation buttons to match header order (Initiatives, Capacity, Roadmap, Metrics).
    - Applied consistent `btn-primary` styling to all navigation buttons.
- **Metrics Page (`pages/metrics/index.tsx`)**:
    - Changed default historical data view (`dateRange` state) to 1 year (previously 6 months).
    - Changed default forecast projection period (`forecastMonths` state) to 1 year (previously 6 months).

### Fixed
- **Metrics Page**: The "1Y" preset button in the date range selector (`components/metrics/DateRangeSelector.tsx`) is now correctly highlighted by default when loading the Table or Chart views, matching the default 1-year date range.

## [v0.0.4g] - 2025-04-08  // Replace with today's date
### Fixed
- Resolved multiple build failures caused by various issues:
    - **ESLint Errors:** Fixed `react/no-unescaped-entities` in `pages/capacity/index.tsx`, `components/initiatives/InitiativeList.tsx`, and `pages/auth/signin.tsx`. Fixed `react-hooks/exhaustive-deps` in `pages/metrics/index.tsx` by wrapping `fetchData` in `useCallback`.
    - **Next.js Config:** Removed development-only keys (`experimental.allowedDevOrigins`, `webpackDevMiddleware`) from `next.config.js`.
    - **Type Mismatches:** Corrected inconsistencies between frontend (`Initiative`, `HistoricalMetric`) and database (`DbInitiativeType`) types when calling `calculateRoadmapSchedule` and in utility functions/components (`utils/schedulingUtils.ts`, `pages/capacity/index.tsx`, `pages/roadmap/index.tsx`, `utils/formatters.ts`, `types/metrics.ts`, `components/metrics/MetricTable.tsx`). Standardized on camelCase for frontend types.
    - **Property Naming:** Fixed snake_case vs camelCase errors (`isMandatory`, `effortEstimate`, `valueLever`, `updatedAt`/`updated_at`, `average_loan_size`/`loan_size`) across multiple files (`components/roadmap/RoadmapGantt.tsx`, `utils/capacityUtils.ts`, `utils/formatters.ts`, `pages/metrics/index.tsx`).
    - **Unused Code:** Removed unused function `selectInitiativesWithinCapacity` and its import from `utils/prioritizationUtils.ts`.
    - **Dev Pages:** Deleted unused/problematic pages `pages/dev/storage-debug.tsx` and `pages/dev/test-schedule.tsx`.
- **Build Process:** Added cache clearing (`rm -rf .next`) to the Replit build command (`.replit`) to mitigate potential build caching issues.
- **Roadmap Gantt Colors:** Fixed logic in `components/roadmap/RoadmapGantt.tsx` to correctly use `isMandatory` (camelCase) for assigning amber color to mandatory initiatives.

## [v0.0.4f] - 2025-04-08
### Changed
- Modified Supabase Row Level Security (RLS) policies for `initiatives`, `historical_metrics`, and `monthly_capacity` tables to allow all authenticated users read access (`SELECT`) and write access (`INSERT`, `UPDATE`, `DELETE`), replacing previous user-specific policies.
- Removed client-side `user_id` filters from data fetching logic in `pages/capacity/index.tsx`, `components/initiatives/InitiativeList.tsx`, and `pages/roadmap/index.tsx` to ensure all data permitted by RLS is retrieved.
- Removed `user_id` filter from real-time subscription in `components/initiatives/InitiativeList.tsx` to allow observation of changes made by any user.
- Removed `user_id` filter from `handleDelete` in `components/initiatives/InitiativeList.tsx` to align with permissive write RLS policy.

### Fixed
- Resolved issue where users could only see their own initiatives, capacity data, and metrics, despite RLS policy intending broader access. Data is now globally visible to all authenticated users.

## [v0.0.4e] - 2025-04-08
### Added
- **Initiative Impact Visualization (Forecast View):**
  - Enhanced `utils/forecastUtils.ts` (`calculateForecast` function) to calculate an `adjustedForecastValues` array, incorporating the cumulative impact of completed initiatives based on their `roadmap_delivery_month`, `value_lever`, `uplift`, and `confidence`.
  - Implemented different calculation logic: direct percentage point addition for `conversion` and `interest_rate`, and relative percentage increase for `average_loan_size`.
  - Updated `pages/metrics/index.tsx` to fetch initiative and capacity data, calculate the schedule using `calculateRoadmapSchedule`, pass required data to `calculateForecast`, and retrieve `adjustedForecastValues`.
  - Updated `components/metrics/ForecastDisplay.tsx` to accept `adjustedForecastValues` as a prop and render it as a new "Adjusted Forecast" line series on the chart, distinct from the baseline "Forecast".
  - Included `adjustedForecastValues` in the Y-axis dynamic range calculation.

### Changed
- Adjusted test data `uplift` values in `db/seeds/01_test_data.sql` for `conversion` and `interest_rate` initiatives to provide a more realistic adjusted forecast visualization.

## [v0.0.4d] - 2025-04-08
### Changed
- **Roadmap Gantt Chart (`components/roadmap/RoadmapGantt.tsx`)**:
  - Now renders duration bars spanning calculated `roadmap_start_month` to `roadmap_delivery_month`.
  - Implemented horizontal scrolling with width dynamically calculated based on schedule duration (approx. 900px/year scale).
  - Simplified color scheme for clarity: Red (deadline missed), Amber (mandatory & on time), Blue (optional & on time).
  - Updated tooltip to show start/delivery months and a "Mandatory" badge styled like the Initiatives page.
  - Resolved various bar rendering issues to ensure accurate visual width.
  - Removed fixed width and `ResponsiveContainer` in favor of scrolling wrapper.
- **Roadmap Page (`pages/roadmap/index.tsx`)**:
  - Removed debug JSON output.
- **Metrics Forecast Chart (`components/metrics/ForecastDisplay.tsx`)**:
  - Fixed incorrect Y-axis scaling for percentage-based metrics (e.g., Conversion Rate).
  - Fixed confidence band rendering by registering `Filler` plugin and refining dataset configuration.
  - Replaced statistical confidence interval calculation with an artificial percentage-based band for visual clarity.
  - Added UI control ("Confidence Level") to allow users to adjust the artificial confidence band width (1-50%).
  - Implemented custom increment/decrement buttons for the Confidence Level input with styling consistent with other controls.
  - Fixed Y-axis scale to be stable when adjusting confidence level by setting absolute min/max based on widest potential band.
  - Ensured chart fills available width by setting `maintainAspectRatio: false`.
  - Removed `beginAtZero: true` from Y-axis for better data centering.
  - Corrected internal data handling to consistently use raw metric values (e.g., 5.1 for 5.1%) for calculations and rely on formatters only for display.
- **Metrics Historical Chart (`components/metrics/MetricChart.tsx`)**:
  - Added dynamic Y-axis domain (`domain` prop) based on data range plus padding for better vertical centering.
  - Changed line interpolation type from `monotone` to `linear` to prevent artificial curves on flat data.
- **Utilities (`utils/forecastUtils.ts`)**:
  - Refactored `calculateForecast` to support artificial confidence band calculation based on a passed percentage.
  - Corrected internal value handling (removed `/ 100` division in `calculateTrend`).

### Fixed
- Resolved various visual rendering issues on forecast and historical metric charts related to axis scaling, confidence bands, and line interpolation.
- Fixed linter errors related to incorrect type names (`loan_size` vs `average_loan_size`).

## [v0.0.4c] - 2025-04-06
### Added
- Enhanced `calculateRoadmapSchedule` utility (`utils/schedulingUtils.ts`) to calculate and return `roadmap_start_month` and a detailed `monthlyAllocation` map showing effort allocated per initiative per month.
- Added `getMonthsBetween` utility function to `utils/dateUtils.ts`.
- Added `calculateScheduledMonthlyLoad` function to `utils/capacityUtils.ts` to accurately calculate total scheduled effort per month based on the scheduler's detailed allocation.

### Changed
- Updated `ScheduledInitiative` type definition to include `roadmap_start_month`.
- Updated `calculateRoadmapSchedule` return type to `ScheduleResult` object containing both `scheduledInitiatives` and `monthlyAllocation`.
- Refactored Capacity page (`pages/capacity/index.tsx`) to fetch initiative and capacity data, call the enhanced `calculateRoadmapSchedule`, and pass schedule results (`scheduledInitiatives`, `monthlyAllocation`, `monthlyCapacities`) down.
- Refactored `CapacityManager` component (`components/capacity/CapacityManager.tsx`) to receive schedule/allocation data via props, removing internal data fetching logic.
- Refactored `CapacityChart` component (`components/capacity/CapacityChart.tsx`):
    - Now uses the detailed `monthlyAllocation` map to calculate and display the precise `scheduledLoad` per month.
    - Chart displays `scheduledLoad` (Bar) vs `availableDays` (Line).
    - Over-capacity warning (`CapacityWarning`) logic updated to use the accurate `scheduledLoad`.
    - Bar coloring now highlights actual over-capacity based on precise monthly allocation (though less likely to occur naturally now).
- Updated titles and descriptions on the Capacity page and chart for clarity.

### Fixed
- Fixed regression on Roadmap page (`pages/roadmap/index.tsx`) where it failed to render because it expected an array from `calculateRoadmapSchedule` instead of the new `ScheduleResult` object.

### Removed
- Removed usage of the previous `calculateMonthlyEffort` function from `CapacityChart` (function deprecated in `utils/capacityUtils.ts`).

## [v0.0.4b] - 2025-04-06  // Replace with today's date
### Added
- Created Roadmap page (`pages/roadmap/index.tsx`) to display the calculated schedule.
- Implemented data fetching for initiatives and capacity on the Roadmap page.
- Integrated `calculateRoadmapSchedule` utility on the Roadmap page.
- Created `RoadmapGantt` component (`components/roadmap/RoadmapGantt.tsx`) using Recharts (`BarChart`).
  - Visualizes scheduled initiatives based on `roadmap_delivery_month` (as markers, not duration bars).
  - Includes tooltips showing initiative details (name, delivery month, effort, formatted value lever).
  - Colors bars based on `value_lever` and uses red for `deadline_missed` items.

### Changed
- Updated `tsconfig.json` to correctly configure `@/*` path aliases.
- Refactored `RoadmapGantt` tooltip to ensure legibility (light background, dark text) and format `value_lever` display.

### Fixed
- Removed redundant `<MainLayout>` wrapper from `pages/roadmap/index.tsx` to fix duplicate navigation header.
- Resolved compilation error on Roadmap page caused by missing component export/definition.
- Corrected type mismatch for `valueLever` prop passed to `getValueLeverDisplay` in `RoadmapGantt` tooltip.

### Removed
- Removed `<ResponsiveContainer>` from `RoadmapGantt` temporarily due to persistent linter errors; chart uses fixed width for now.

### Known Issues
- Linter error related to `<ResponsiveContainer>` in `RoadmapGantt` needs further investigation if responsiveness is required.
- Forecasting logic (now planned for v0.0.4e) needs revision to handle `uplift` consistently as a percentage (carried over from v0.0.4a).

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
- Missing database constraints for initiative fields (`effort_estimate`