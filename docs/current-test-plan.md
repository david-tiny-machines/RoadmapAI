# Metrics Functionality Test Plan

This document outlines the testing approach for the historical metrics functionality implemented in Phase 3.

## Prerequisites
- Access to the application development environment
- Supabase credentials to check database entries
- Admin access (for checking RLS policies)

## Test Environment
- Browser: Chrome/Firefox/Safari latest version
- Screen size: Desktop viewport (1920x1080)
- Network: Test under normal conditions and simulated slow connection (1.5 Mbps, 150ms latency)

## Test Cases

### 1. Access the Metrics Page
- **Action**: Navigate to `/metrics` in the browser
- **Expected Result**: 
  - "Historical Metrics" page loads with title
  - "Add New Metric" form section is visible with Type, Month, and Value fields
  - "Existing Metrics" table section is visible with column headers
  - No JavaScript errors in console

### 2. Form Validation Tests
- **Test 2.1**: Try submitting an empty form
  - **Action**: Delete the "0" from the Value field and attempt to submit
  - **Expected Result**: Form submission is prevented, field validation messages appear
  - **Observed Issue**: When deleting the "0" value from the number input, a warning appears in the console: "Warning: Received NaN for the 'value' attribute. If this is expected, cast the value to a string."
  - **Bug Description**: When the input is empty, parseFloat() in the onChange handler returns NaN, causing React to warn about invalid value attributes
  - **Test Result**: Pass with issues - Browser validation shows "Please fill in this field" message correctly, but multiple React console errors appear:
    - "Received NaN for the 'value' attribute"
    - "The specified value 'NaN' cannot be parsed, or is out of range"
  
- **Test 2.2**: Enter a negative value
  - **Action**: Enter "-1" in the Value field and attempt to submit
  - **Expected Result**: Input is prevented by the min="0" attribute, browser shows validation message
  - **Test Result**: Pass - When entering "-1", browser correctly displays validation message "Value must be greater than or equal to 0." The form prevents submission as expected.
  
- **Test 2.3**: Check month dropdown
  - **Action**: Open the Month dropdown and verify available options
  - **Expected Result**: 
    - Only past months are shown, not current or future months (e.g., if current month is Apr 2025, last option should be Mar 2025)
    - Months are in descending order (most recent first)
    - Month format is user-friendly (e.g., "Mar 2025" not "2025-03")
  - **Test Result**: Pass - The month dropdown correctly displays past months in descending order with a user-friendly format. No issues observed.

### 3. Adding Metrics
- **Test 3.1**: Add Conversion Rate
  - **Action**: 
    - Select "Conversion" from Type dropdown
    - Select Jan 2025 from Month dropdown
    - Enter value 5.25 in Value field
    - Click "Save Metric"
  - **Expected Result**:
    - Loading state appears (button text changes to "Saving...")
    - Metric appears in table after submission with:
      - Type: "Conversion"
      - Month: "Jan 2025"
      - Value: "5.25"
    - Form value resets to 0
    - No error messages
  - **Test Result**: Pass
    - Loading state and form reset worked correctly
    - Metric saved with correct month (Jan 2025)
    - Value and type saved correctly
    - Initial RLS error was resolved
    - Month selection bug fixed with direct date value handling

- **Test 3.2**: Add Average Loan Size
  - **Action**:
    - Select "Average Loan Size" from Type dropdown
    - Select Dec 2024 from Month dropdown
    - Enter value 250000 in Value field
    - Click "Save Metric"
  - **Expected Result**:
    - Metric appears in table with:
      - Type: "Average Loan Size"
      - Month: "Dec 2024"
      - Value: "250,000.00" (properly formatted)
    - Form resets after submission
  - **Test Result**: Pass
    - Large number handled and displayed correctly (250000.00)
    - Form reset worked properly
    - Month saved correctly as Dec 2024
    - Month selection working correctly with new date handling

- **Test 3.3**: Add Interest Rate
  - **Action**:
    - Select "Interest Rate" from Type dropdown
    - Select Nov 2024 from Month dropdown
    - Enter value 3.75 in Value field
    - Click "Save Metric"
  - **Expected Result**:
    - Metric appears in table with:
      - Type: "Interest Rate"
      - Month: "Nov 2024"
      - Value: "3.75" (two decimal places)
    - Form resets after submission
  - **Test Result**: Pass
    - Interest Rate metric added successfully
    - Month (Nov 2024) saved correctly
    - Value (3.75) displayed with correct decimal places
    - Form reset to initial state
    - Note: Multiple GoTrueClient warnings in console, but these are documented and don't affect functionality

- **Test 3.4**: Date Handling Verification
  - **Action**:
    - Select Oct 2024 from Month dropdown
    - Submit a test metric (Conversion, value: 1.00)
  - **Expected Result**:
    - Selected month in dropdown matches the month shown in the table
    - Month is stored correctly in database as "2024-10-01"
  - **Note**: Limited to testing with Oct 2024 as Nov 2024 through Jan 2025 already contain data
  - **Test Result**: Pass
    - Conversion metric added successfully with value 1.00
    - Month (Oct 2024) saved and displayed correctly
    - Last Updated timestamp recorded (05/04/2025)
    - Form reset properly after submission

### 4. Database Constraint Tests
- **Test 4.1**: Unique Constraint
  - **Action**: 
    - Select "Conversion" from Type dropdown
    - Select Jan 2025 from Month dropdown (same as existing metric)
    - Enter value 7.50 in Value field
    - Click "Save Metric"
  - **Expected Result**:
    - Error message appears: "duplicate key value violates unique constraint"
    - Form remains filled with entered values (7.50)
    - Database rejects the duplicate entry (verify with SQL query)
  - **Test Result**: Pass
    - Error message displayed correctly
    - Form values remained unchanged after error
    - Database prevented duplicate entry
    - Error message was clear and user-friendly: "A Conversion metric for Jan 2025 already exists"

- **Test 4.2**: Date Format in Database
  - **Action**: 
    - Add metric for Feb 2025 with any value
    - Run SQL query to check database entry
  - **Expected Result**:
    - Month is stored as "2025-02-01" (first day of month)
    - Time component is 00:00:00 UTC
  - **Test Result**: Pass
    - All months are correctly stored as first day of month:
      - Feb 2025 stored as "2025-02-01"
      - Jan 2025 stored as "2025-01-01"
      - Dec 2024 stored as "2024-12-01"
      - Nov 2024 stored as "2024-11-01"
      - Oct 2024 stored as "2024-10-01"
    - Timestamps include proper UTC timezone (+00)
    - Data is sorted correctly by month in descending order

### 5. Display and Interaction Tests
- **Test 5.1**: Sorting Order
  - **Action**: 
    - Verify existing metrics are sorted correctly:
      - Conversion (Feb 2025)
      - Conversion (Jan 2025)
      - Average Loan Size (Dec 2024)
      - Interest Rate (Nov 2024)
      - Conversion (Oct 2024)
  - **Expected Result**:
    - Metrics are sorted by month descending (newest first)
    - Within same month, metrics would be sorted by type alphabetically
    - Table shows correct order:
      1. Feb 2025 - Conversion (1.00)
      2. Jan 2025 - Conversion (5.25)
      3. Dec 2024 - Average Loan Size (250,000.00)
      4. Nov 2024 - Interest Rate (3.75)
      5. Oct 2024 - Conversion (1.00)
  - **Note**: No need to add more metrics as we already have a good test set with multiple months and types
  - **Test Result**: Pass
    - All metrics are correctly sorted by month (descending)
    - Values match expected test data exactly
    - New tabbed interface provides improved organization by metric type
    - Each tab maintains correct chronological order

- **Test 5.2**: Numerical Display
  - **Action**: Add metrics with various number formats:
    - Integer: 42
    - Decimal: 3.14159
    - Large number: 1234567.89
  - **Expected Result**:
    - All numbers show exactly 2 decimal places (42.00, 3.14, 1,234,567.89)
    - Large numbers use comma separators
    - No scientific notation used

- **Test 5.3**: Layout Verification
  - **Action**: Test at desktop resolution (1920x1080)
  - **Expected Result**:
    - Form and table display properly in desktop view
    - All elements are properly aligned and spaced
    - No content overflow or layout issues

### 6. Authentication Tests
- **Test 6.1**: Access Control
  - **Action**: 
    - Click "Sign out" button
    - Attempt to access `/metrics` directly via URL
  - **Expected Result**:
    - Redirected to login page
    - After login, redirected back to metrics page
    - No unauthorized access to metrics data

- **Test 6.2**: Admin Access
  - **Action**: 
    - Login as regular user (non-admin)
    - Attempt to add and modify metrics
  - **Expected Result**:
    - All operations allowed (per updated RLS policy)
    - No admin-specific features visible

### 7. Error Handling
- **Test 7.1**: Network Error
  - **Action**: 
    - Disable network connection
    - Try to submit a new metric
  - **Expected Result**:
    - Error message shows "Network error" or similar
    - Form data remains in fields
    - Submit button re-enabled after error

- **Test 7.2**: Server Error
  - **Action**: 
    - (Simulated) Cause a 500 error from server
    - Attempt normal metric submission
  - **Expected Result**:
    - User-friendly error message appears
    - Form data preserved
    - Submit button re-enabled
    - Error logged to console

## Documentation of Results
For each test case, document:
- Pass/Fail status
- Any unexpected behavior (with screenshots)
- Error messages (if applicable)
- Environment details (browser version)

## Regression Testing
After fixing any issues, re-run:
- All failed tests
- Any tests that might be affected by the fixes
- Key functionality tests (adding metrics, viewing metrics)

## Performance Considerations
- Page load time should be under 2 seconds on broadband connection
- Form submission should complete within 3 seconds
- Table should render smoothly with 100+ records
- No visible lag when changing dropdown selections
