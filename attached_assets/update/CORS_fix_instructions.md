# CORS Fix Instructions

## Issue
The application is experiencing CORS (Cross-Origin Resource Sharing) errors when making requests from the Netlify site (`https://the-hubja.netlify.app`) to the Google Apps Script backend. The error specifically shows that the `Access-Control-Allow-Origin` header is missing in the responses.

## Root Cause
Google Apps Script has specific requirements for handling CORS properly. The main issues identified:

1. Using `HtmlService.createHtmlOutput()` instead of `ContentService.createTextOutput()` for JSON responses
2. Not consistently applying CORS headers across all response types
3. Not properly handling OPTIONS preflight requests

## Solution

The following changes have been made to fix the CORS issues:

1. Changed the `sendResponse` function to use `ContentService.createTextOutput()` instead of `HtmlService.createHtmlOutput()`
2. Added all required CORS headers to the `sendResponse` function:
   - `Access-Control-Allow-Origin: https://the-hubja.netlify.app`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type`
3. Updated the `doOptions` function to properly handle preflight requests with all required headers
4. Ensured consistent header handling in both `doGet` and `doPost` functions

## Implementation Steps

1. Open your Google Apps Script project
2. Replace the entire script with the contents of the `updated_script.js` file provided
3. Save the script
4. Deploy a new version:
   - Click on Deploy > New deployment
   - Select type: Web app
   - Set the following:
     - Description: TheHub Reviews and Ratings API
     - Execute as: Me
     - Who has access: Anyone
   - Click Deploy
   - Copy the new web app URL
5. Update the client-side code with the new URL (this has already been done in the previous steps)

## Testing

1. After deploying, test the application by visiting the Netlify site
2. Check the browser's developer console for any CORS errors
3. Verify that votes and reviews are loading correctly
4. Test submitting new votes and reviews

## Additional Notes

If you continue to experience CORS issues after implementing these changes, consider the following:

1. Clear your browser cache completely
2. Ensure you're using the latest deployed URL in your client code
3. Check that the Netlify domain exactly matches what's specified in the CORS headers
4. Verify that the Google Apps Script is deployed with the correct access settings