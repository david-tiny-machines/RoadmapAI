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

### Changed
- Migrated from local storage to Supabase database
- Updated MainLayout to handle auth state
- Enhanced error handling in auth flows

### Technical
- Added Supabase client configuration
- Implemented RLS policies for data security
- Added TypeScript types for auth context

### Known Issues
- Initiative date range calculation in `utils/capacityUtils.ts` may fail if `monthlyCapacities` has fewer than three entries
- Type safety issue in `CapacityChart.tsx` where `CapacityWarning` component uses `any[]` type instead of proper `MonthlyEffort` interface
- Initiative list state in `InitiativeList.tsx` may become out of sync with parent's initiatives prop due to missing dependency array
- Bulk update feature in `CapacityManager.tsx` lacks validation for negative numbers and invalid inputs

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