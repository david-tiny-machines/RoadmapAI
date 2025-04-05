# Technical Debt and Infrastructure Improvements

This document tracks technical improvements that should be made to improve code quality, maintainability, and development efficiency.

## Testing Infrastructure

### Current Status
- No automated testing infrastructure
- Manual testing only through `current-test-plan.md`
- No CI/CD pipeline for test execution

### Proposed Implementation
1. **Testing Framework Setup**
   - Add Jest and React Testing Library
   - Configure TypeScript support
   - Add test scripts to package.json

2. **Test Types to Implement**
   - Unit tests for utility functions
   - Component tests for React components
   - Integration tests for Supabase interactions
   - Type validation tests for database/frontend type alignment

3. **Priority Test Areas**
   - Database type conversions (e.g., metric_type ENUM handling)
   - Date handling utilities
   - Form validation logic
   - Data transformation functions

4. **Implementation Steps**
   ```bash
   # Add dependencies
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest
   
   # Add test script to package.json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch"
     }
   }
   ```

5. **Example Test Structure**
   ```typescript
   // __tests__/types/database.test.ts
   import { DbMetricType, METRIC_TYPE_DISPLAY } from '../../types/database';

   describe('Database Types', () => {
     test('METRIC_TYPE_DISPLAY contains all enum values', () => {
       const enumValues: DbMetricType[] = ['conversion', 'loan_size', 'interest_rate'];
       enumValues.forEach(value => {
         expect(METRIC_TYPE_DISPLAY[value]).toBeDefined();
       });
     });
   });
   ```

### Benefits
1. Catch type mismatches early
2. Prevent regressions
3. Document expected behavior
4. Facilitate safer refactoring

### Timeline
- Should be implemented before Phase 4 to ensure stability as complexity grows
- Can be done incrementally, starting with critical utility functions

## Type System Improvements

### Current Issues
1. **Database/Frontend Type Mismatches**
   - ENUM values not aligned (e.g., metric_type case differences)
   - Inconsistent naming conventions between layers
   - Lack of type-safe conversions

### Proposed Solutions
1. Create dedicated database type definitions
2. Implement type conversion utilities
3. Add runtime validation
4. Document type conventions 