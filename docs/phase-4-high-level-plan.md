# Phase 4: Roadmap Visualization (Single Scenario) - High-Level Plan

This document outlines the planned incremental delivery for Phase 4, focusing on visualizing the impact and timeline of the single, active roadmap.

## Build Approach

Phase 4 will be delivered in five distinct versions (updated from four):

### v0.0.4a: Setup Test Data & Implement Scheduling Logic (Delivery Month)

*   **Goal:** Establish a consistent test data environment and determine the realistic completion month (`roadmap_delivery_month`) for each initiative based on priority, effort, and available capacity.
*   **Functionality:**
    *   **(Setup Task):** Define and populate `initiatives` and `monthly_capacity` tables with test data.
    *   **(Core Task):** Implement backend/utility logic (`calculateRoadmapSchedule`) for dynamic scheduling calculation based on priority, effort, and capacity to determine `roadmap_delivery_month` and `deadline_missed` flag.
*   **Technical Considerations:**
    *   SQL seed scripts (`db/seeds/test_data.sql`).
    *   Scheduling utility functions (`utils/schedulingUtils.ts`).
    *   Handles sorting, iterative capacity allocation, `start_month` constraints.
    *   Outputs `ScheduledInitiative[]` including `roadmap_delivery_month` and `deadline_missed`.

### v0.0.4b: Basic Gantt Visualization (Roadmap View - Delivery Markers)

*   **Goal:** Visualize the calculated schedule via a simple Gantt chart on a new Roadmap page, initially showing only delivery month markers.
*   **Functionality:** Integrate a new Gantt-style chart (`RoadmapGantt.tsx`) on the new roadmap page (`pages/roadmap/index.tsx`). Display initiatives based on their calculated `roadmap_delivery_month` from `v0.0.4a`.
*   **Technical Considerations:**
    *   New page `pages/roadmap/index.tsx` using `MainLayout`.
    *   New component `components/roadmap/RoadmapGantt.tsx` (using Recharts).
    *   Fetch initiative/capacity data, call `calculateRoadmapSchedule`, pass data to Gantt component.
    *   Gantt displays markers at `roadmap_delivery_month`, handles tooltips, conditional coloring for `deadline_missed`.

### v0.0.4c: Enhance Scheduling Logic & Capacity View

*   **Goal:** Enhance the scheduling logic to determine start months and update the Capacity page to accurately reflect monthly effort allocation.
*   **Functionality:**
    *   **(Scheduler Enhancement):** Modify `calculateRoadmapSchedule` to also determine the actual start month (`roadmap_start_month`) when effort allocation begins for each initiative.
    *   **(Capacity View Update):** Update the *existing* chart on the dedicated Capacity page (`pages/capacity/index.tsx`) to use the *scheduled monthly effort allocation* derived from the calculated `roadmap_start_month` and `roadmap_delivery_month`. Ensure its comparison of allocated effort vs. available capacity accurately reflects the schedule and highlights overages correctly.
*   **Technical Considerations:**
    *   Refactor `utils/schedulingUtils.ts` to track and return `roadmap_start_month`.
    *   Update `ScheduledInitiative` type.
    *   Refactor data fetching/processing for the capacity chart component(s) in `pages/capacity/index.tsx`.
    *   Input the enhanced schedule data (with start and delivery months).
    *   Modify the capacity chart rendering to visualize scheduled load vs. available capacity per month.

### v0.0.4d: Enhance Gantt Visualization (Roadmap View - Duration Bars)

*   **Goal:** Enhance the Roadmap page's Gantt chart to show full duration bars.
*   **Functionality:** Update the `RoadmapGantt` component to display initiatives as bars spanning from their `roadmap_start_month` to their `roadmap_delivery_month`.
*   **Technical Considerations:**
    *   Modify `components/roadmap/RoadmapGantt.tsx`.
    *   Consume the enhanced `ScheduledInitiative[]` data (including `roadmap_start_month`).
    *   Update the Recharts implementation (likely the custom `shape` function or bar configuration) to draw bars based on the start/delivery month range.
    *   *(Optional):* Re-evaluate using `ResponsiveContainer`.

### v0.0.4e: Initiative Impact Visualization (Forecast View)

*   **Goal:** Show how the capacity-constrained roadmap impacts the metric forecasts.
*   **Functionality:** Update the forecast charts on the Metrics page (`pages/metrics/index.tsx` or related components) to display an "Adjusted Forecast" line. This line is calculated as `Baseline_Forecast + SUM(initiative.uplift * initiative.confidence)` for relevant initiatives completed by each forecast month, based on the `roadmap_delivery_month`.
*   **Technical Considerations:**
    *   Modify forecasting utility functions (`utils/forecastUtils.ts`) and/or components (`ForecastDisplay.tsx`).
    *   Input baseline forecast data and the scheduled initiative data (including `roadmap_delivery_month`).
    *   Implement the defined impact calculation: `Adjusted = Baseline + (Uplift * Confidence)`. (Note: Specific logic varies by metric type as implemented - point addition for % metrics, relative % for currency).
    *   Ensure correct mapping of `value_lever` to the affected metric.
    *   Handle the scale/units of `uplift` and `confidence` correctly.
    *   Update chart rendering to include the adjusted forecast series.
*   **Status:** COMPLETE

## Database Schema

No database schema changes are anticipated for Phase 4. The core schedule outputs (`roadmap_delivery_month`, `roadmap_start_month`) will be calculated dynamically. Test data setup uses standard SQL `INSERT`/`DELETE` commands via the Supabase SQL Editor. 