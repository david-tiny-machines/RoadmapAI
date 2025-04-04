# Changelog

All notable changes to the RoadmapAI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Auto-prioritization (upcoming)
- Manual drag/drop functionality (upcoming)
- Handling of mandatory items in prioritization (upcoming)

### Changed
- Moved storage testing page to `/dev/storage-debug` for development use

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