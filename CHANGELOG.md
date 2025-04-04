# Changelog

All notable changes to the RoadmapAI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Implemented drag-and-drop functionality using @dnd-kit
- Added priority score calculation and display
- Added reset priority functionality with confirmation modal
- Added delete initiative confirmation modal
- Added mandatory item badges and visual distinction
- Added date range display in initiative cards
- Added clear explanation of priority calculation
- Added prevention of dragging optional items above mandatory ones

### Changed
- Improved initiative card layout and design
- Enhanced visual hierarchy in initiative display
- Updated priority calculation explanation to be more user-friendly
- Optimized state management for drag-and-drop operations
- Improved date formatting for better readability

### Fixed
- Fixed state stability issues during drag operations
- Fixed initiative ordering when adding new items
- Fixed visual feedback during drag operations
- Fixed date display formatting

### Technical
- Migrated to @dnd-kit from react-beautiful-dnd
- Added comprehensive JSDoc documentation
- Improved type safety across components
- Enhanced error handling for storage operations
- Optimized component rendering performance

## [0.1.0] - 2025-04-04
### Added
- Initiative entry UI with all required fields:
  - Name
  - Value lever selection
  - Estimated uplift
  - Confidence
  - Effort estimate
  - Optional start/end month
  - Mandatory toggle
- Basic capacity management:
  - Monthly capacity setting
  - Capacity visualization
  - Effort vs. availability charts
- Data persistence using local storage
- Responsive layout with modern UI design
- Core utility functions:
  - Capacity calculations
  - Date formatting and handling

### Changed
- Improved field naming consistency
- Enhanced data persistence between views
- Optimized development configuration

### Fixed
- Data persistence issues between views
- Field name inconsistencies (uplift vs estimatedUplift)
- Development environment configuration

### Technical
- Added JSDoc documentation to utility functions
- Cleaned up project structure
- Improved development environment setup
- Added comprehensive type definitions 