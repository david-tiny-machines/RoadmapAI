# Phase 4: Roadmap Visualization (Single Scenario) - High-Level Plan

This document outlines the planned incremental delivery for Phase 4, focusing on visualizing the impact and timeline of the single, active roadmap.

## Build Approach

Phase 4 will be delivered in four distinct versions:

### v0.0.4a: Setup Test Data & Implement Scheduling Logic

*   **Goal:** Establish a consistent test data environment and determine the realistic completion month (`roadmap_delivery_month`) for each initiative based on priority, effort, and available capacity.
*   **Functionality:**
    *   **(Setup Task):** Define and populate `initiatives` and `monthly_capacity` tables with a diverse set of test data using SQL scripts via the Supabase SQL Editor. Optionally clear existing data first. Save seed scripts (e.g., in `db/seeds/test_data.sql`).
    *   **(Core Task):** Implement backend/utility logic for dynamic scheduling calculation based on priority, effort estimate, and available monthly capacity.
*   **Technical Considerations:**
    *   Write and execute SQL `DELETE` (optional) and `INSERT` statements in Supabase SQL Editor. Commit seed scripts to the repository.
    *   Create scheduling utility functions (e.g., in `utils/schedulingUtils.ts`).
    *   Handle sorting by mandatory status and priority score.
    *   Allocate effort against monthly capacity iteratively, respecting optional `start_month` constraints.
    *   Output initiative data augmented with the calculated `roadmap_delivery_month` and a `deadline_missed` flag (comparing delivery to optional `end_month`). Data likely held in frontend state initially.
    *   Ensure calculation logic is triggered/refreshed appropriately when underlying data (initiatives, capacity) changes.
    *   Consider edge cases (insufficient capacity, initiatives spanning months, start dates after capacity horizon).

### v0.0.4b: Gantt Visualization (Roadmap View)

*   **Goal:** Visualize the calculated schedule via a Gantt chart on the main roadmap view.
*   **Functionality:** Integrate a new Gantt-style chart into the primary roadmap page (e.g., `pages/index.tsx` or a dedicated component). Display initiatives based on their calculated `roadmap_delivery_month` from `v0.0.4a`, visually indicating their timing and potentially duration.
*   **Technical Considerations:**
    *   Create and integrate a new React component (e.g., `RoadmapGantt.tsx`).
    *   Consume the schedule data (initiatives augmented with `roadmap_delivery_month`) calculated in `v0.0.4a`.
    *   Choose or build suitable Gantt chart visualization elements (consider libraries like Recharts, or custom implementation).
    *   Ensure the component updates dynamically when the schedule changes.

### v0.0.4c: Enhanced Capacity Logic (Capacity View)

*   **Goal:** Enhance the dedicated capacity page with the new scheduling logic.
*   **Functionality:** Update the *existing* chart on the dedicated Capacity page (e.g., `pages/capacity/index.tsx`) to use the *scheduled* monthly effort allocation determined in `v0.0.4a`. Ensure its comparison of allocated effort vs. available capacity accurately reflects the schedule and highlights overages correctly.
*   **Technical Considerations:**
    *   Identify and refactor the data fetching and processing logic for the existing capacity chart component(s).
    *   Input the scheduled effort allocation data calculated in `v0.0.4a`.
    *   Modify the chart rendering if necessary to clearly visualize scheduled load vs. available capacity and highlight discrepancies.
    *   Ensure the view updates dynamically when the schedule or capacity changes.

### v0.0.4d: Initiative Impact Visualization (Forecast View)

*   **Goal:** Show how the capacity-constrained roadmap impacts the metric forecasts.
*   **Functionality:** Update the forecast charts on the Metrics page (e.g., in `pages/metrics/index.tsx` or related components) to display an "Adjusted Forecast" line. This line is calculated as `Baseline_Forecast + SUM(initiative.uplift * initiative.confidence)` for relevant initiatives completed by each forecast month, based on the `roadmap_delivery_month` from `v0.0.4a`.
*   **Technical Considerations:**
    *   Modify forecasting utility functions (`utils/forecastUtils.ts`) and/or components (`ForecastDisplay.tsx`).
    *   Input baseline forecast data and the scheduled initiative data (including `roadmap_delivery_month`).
    *   Implement the defined impact calculation: `Adjusted = Baseline + (Uplift * Confidence)`.
    *   Ensure correct mapping of `value_lever` to the affected metric (`Conversion`, `Average Loan Size`, `Interest Rate`). Levers `Customer acquisition`, `Customer retention`, `Business as usual (BAU)` do not impact forecasts.
    *   Handle the scale/units of `uplift` and `confidence` correctly.
    *   Update chart rendering to include the adjusted forecast series.
    *   Ensure the forecast view updates dynamically when the schedule or initiative details change.

## Database Schema

No database schema changes are anticipated for Phase 4. The core output (`roadmap_delivery_month`) will be calculated dynamically. Test data setup will use standard SQL `INSERT`/`DELETE` commands via the Supabase SQL Editor. 