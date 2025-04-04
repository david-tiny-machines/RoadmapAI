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