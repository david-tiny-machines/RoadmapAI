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
- Value lever impacted (e.g., Conversion, Average Loan Size, Interest Rate, Customer Acquisition, Customer Retention, Cost Reduction, Compliance/Risk Mitigation, BAU obligations)
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
- Display forecast uplift vs. historic baseline
- Track business metrics: conversion, loan size, interest rate
- **Integrate Supabase for:**
  - Database setup for storing historical metrics
  - Basic authentication
  - Data persistence layer
  - User management

### 🔁 Phase 4: Scenario & Goal Planning
- Clone, tweak, and compare roadmap options
- Leverage Supabase for:
  - Scenario storage and versioning
  - User permissions and sharing
  - Real-time collaboration features

### 🧮 Phase 5: Timeline & Capacity Visualisation
- Gantt-style layout
- Team usage and resource fit
- Enhanced Supabase features:
  - Team capacity tracking
  - Resource allocation history
  - Advanced querying for timeline views

### 🛠️ Phase 6: Admin Interface
- Monthly team capacity inputs
- Version history and sharing
- Complete Supabase integration:
  - Admin role management
  - Audit logging
  - Data export/import capabilities

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

## ❓ Open Questions
- How should the tool handle over-capacity when mandatory items are included?
- Should levers have diminishing returns or caps?
- Can confidence scoring be AI-assisted?
- Do we need role-based capacity tracking or is total team capacity sufficient?

