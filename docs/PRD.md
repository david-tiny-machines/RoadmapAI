# Product Requirements Document: RoadmapAI (v0.1)

## 🛍️ Overview
**Product Name:** RoadmapAI  
**Author:** David Malpas  
**Stakeholder:** Marija Stulich (Head of Product, Harmoney)  
**Status:** Draft  
**Date:** 3 April 2025

## 📌 Problem Statement
Harmoney's product roadmap and forecasting processes are currently:
- Highly manual, managed across Slack, Miro, Google Sheets, and ad hoc SQL.
- Opaque to stakeholders, making it hard to visualise trade-offs or communicate plan viability.
- Time-consuming, with effort duplicated by multiple people, often leading to confusion.
- Inflexible, struggling to adapt quickly when delivery timelines shift or priorities change.

A lightweight tool that integrates roadmapping, prioritisation, forecasting, and scenario planning would reduce toil, increase transparency, and improve strategic alignment.

## 🌟 Goals & Users
### 🎯 Goals
| Goal | Success Criteria |
|------|------------------|
| Make roadmap input and prioritisation faster | Users can input initiatives with key attributes in under 2 mins |
| Automate impact-weighted prioritisation | Tool returns a ranked list that fits within capacity constraints |
| Forecast outcomes based on roadmap | Forecast charts update dynamically with each scenario |
| Enable flexible scenario planning | Users can create, compare, and save multiple roadmap options |
| Communicate plans clearly | Roadmaps are visualised with timelines, capacity, and forecast impact |

### 👤 Users
- **Primary:** Chief Product Officer, Head of Product  
- **Secondary:** Product Managers, Delivery Manager, CDO, SLT stakeholders

## 🔧 Core Capabilities
### 1. Initiative Input UI
Add initiatives with:
- Name
- Value lever impacted (i.e.
Conversion
Average loan size
Interest rate
Customer acquisition
Customer retention
Business as usual (BAU)
)
- Estimated uplift (%)
- Confidence (0–100%)
- Effort estimate (in days)
- Optional: Start/End month
- Mandatory toggle
- (Future): Bulk CSV import

### 2. Roadmap Optimisation Engine
- Calculates Weighted Impact = Uplift × Confidence
- Auto-selects initiatives based on available capacity
- Includes mandatory initiatives
- Supports manual reordering and overrides

### 3. Forecasting Engine
- Upload or input monthly historic conversion rates
- Forecast charts for:
  - Conversion
  - Average Loan Size
  - Interest Rate
- Baseline + cumulative uplift over time
- Flags delays in realisation

### 4. Scenario & Goal-Driven Planning
This capability combines two closely related needs: scenario planning (user-led) and goal-based planning (system-led).
- Save, name, and clone multiple roadmap scenarios
- Allow user to set a target (e.g., "reach 10.4% conversion by September")
- Tool returns viable initiative combinations to meet that goal
- Compare scenarios side-by-side (timeline, forecast, capacity use)

### 5. Timeline & Capacity Planning
Helps stakeholders understand when value is delivered and how team capacity is allocated over time.
- Gantt-style roadmap view
- Monthly effort vs. available capacity
- Visualise team allocation
- Colour-coded by lever/type

### 6. Capacity Input Interface
- Admin-defined monthly capacity (in days)
- Supports different teams and capacity shifts
- Editable over time

## 🛡️ Technical Notes
- Backend: Supabase for database and authentication
- Development environment: Cursor IDE connected to Replit via SSH
- Deployment: Managed via Replit runtime
- Git Integration: Provided natively through Replit
- Harmoney's stack includes:
  - Frontend: React, Next.js, TailwindCSS
  - Backend: Node.js, TypeScript
  - Data Layer: Snowflake, SQL
  - Other Tools: Intercom, Slack, Google Sheets, Miro, AskNicely

## 🧱 Build Approach
### ✅ Phase 1: Input & Visual Validation
- Initiative entry UI
- Basic capacity setting
- Visualise effort vs. availability
- Local storage for data persistence

### ⚙️ Phase 2: Optimisation & Prioritisation
- Auto-prioritisation (uplift × confidence)
- Manual drag/drop, handle mandatory items
- Continue using local storage

### 📈 Phase 3: Forecasting Engine & Data Infrastructure
- Basic forecasting capabilities:
  - Historical metric tracking (conversion, loan size, interest rate)
  - Trend-based forecasting with confidence intervals
  - Metric visualization and charts
- **Integrate Supabase for:**
  - Database setup for storing historical metrics
  - Basic authentication
  - Data persistence layer
  - User management
  - Migration of local data:
    - Initiative data with proper user associations
    - Capacity data and team allocations
    - Historical preferences and settings
  - Enhanced data model with:
    - Foreign key relationships
    - Database constraints
    - Data validation rules
  - Real-time sync capabilities

### 🔁 Phase 4: Roadmap Visualization (Single Scenario)
- **Initiative Impact Visualization:**
  - Connect initiatives to forecasts for the *single* current roadmap.
  - Calculate cumulative uplift (based on value lever, uplift %, confidence, dates).
  - Show baseline vs. initiative-adjusted forecasts for key metrics.
  - Ensure forecasts update dynamically with initiative changes.
- **Timeline & Capacity Visualization:**
  - Display initiatives chronologically against monthly available capacity.
  - Visualize total effort per month and flag over-capacity periods.
  - Ensure timeline/capacity view updates dynamically with initiative changes.
- Continues to leverage Supabase for data persistence.

### 🧮 Phase 5: Scenario Management
- Introduce saving, loading, cloning, and naming multiple roadmap scenarios.
- Allow users to select an active scenario to view/edit.
- Implement a comparison view for side-by-side analysis of scenarios (timelines, forecasts, capacity).
- Leverage Supabase for scenario storage, versioning, and potentially user permissions.

### 🛠️ Phase 6: Goal Seeking & Admin Interface
- **Goal Setting:** Allow users to define target metrics/dates within a scenario context.
- **Admin Interface:**
  - Monthly team capacity inputs.
  - User management and role definition.
  - Version history and sharing controls.
  - Data export/import capabilities.
- **(Future/Advanced):** Implement goal-seeking logic to suggest initiative combinations.
- Complete Supabase integration for admin roles, audit logging, etc.

## 🧠 Assumptions
- Value levers, uplift %, and effort estimates are input manually
- Monthly capacity values are user-defined in-app
- Historic metrics (e.g., conversion) are uploaded manually or imported from source systems
- Forecasts are indicative, not exact
- Roadmaps may be collaboratively edited

## 🧩 Integrations (Future Phases)
- Slack: roadmap broadcast and backlog sync
- Google Sheets: initiative/forecast data exchange
- Intercom: tagging and sentiment inputs
- AskNicely: NPS feedback integration
- Snowflake: KPI syncing (conversion, loan size, interest rate)
- FullStory: optional tagging support

## 🤖 Agentic Roadmap (Future Vision)
Over time, RoadmapAI could evolve into an integrated agent network designed to automate and augment product management workflows. These agents would work together to reduce manual effort, synthesise strategic insights, and provide high-leverage recommendations. Example agents include:

### 1. Roadmap Navigator Agent
**Goal:** Monitor progress against strategic targets and guide roadmap adjustments  
**Behaviours:**
- Detect when roadmap drift risks missing a key forecast (e.g. conversion, loan size)
- Recommend changes to initiative timing or sequence to stay on track
- Suggest alternative initiatives when high-impact items are delayed or unfeasible

### 2. Forecast Explainer Agent
**Goal:** Synthesise and narrate changes in roadmap forecasts  
**Behaviours:**
- Track variance from baseline
- Attribute changes to specific initiatives or delays
- Generate leadership-ready summaries

### 3. Portfolio Synthesiser Agent
**Goal:** Synthesise the results of potential roadmap changes to support prioritisation  
**Behaviours:**
- Highlight which levers are over- or under-served
- Show trade-offs across time, capacity, and forecast value
- Suggest optimised initiative sets to improve portfolio balance

### 4. Market Signal Agent *(Future Scope)*
**Goal:** Monitor competitor activity and synthesise emerging product opportunities  
**Behaviours:**
- Scrape public pricing/offering changes
- Surface trends by region or vertical
- Suggest initiative ideas and estimated impact ranges

## Next Steps
- Add initiative impact overlays
- Implement forecast vs actual tracking
- Enhance forecasting capabilities:
  - Add multiple forecasting models (e.g., exponential, weighted moving average, seasonal)
  - Allow manual adjustments to forecasted values
  - Support override of individual forecast points
  - Add model comparison and accuracy tracking
  - Include confidence interval customization
- Support seasonal pattern recognition
- Add forecast export/import functionality
- Integrate with initiatives (Phase 4)

## ❓ Open Questions
- How should the tool handle over-capacity when mandatory items are included?
- Should levers have diminishing returns or caps?
- Can confidence scoring be AI-assisted?
- Do we need role-based capacity tracking or is total team capacity sufficient?
- Which additional forecasting models would be most valuable for the business?
- Should manual forecast adjustments require approval or documentation?

