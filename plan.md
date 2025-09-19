# Implementation Plan for IP Address Tracking in Review & Rating System

## Overview
This plan outlines the implementation of IP address tracking for the Review & Rating system to enforce the following restrictions:
- Limit users to only 1 like OR dislike per business (not both)
- Limit users to only 5 reviews per business per day

## Backend Implementation (Google Apps Script)

### 1. Schema Updates
- Add `IPAddress` column to the following sheets:
  - Votes sheet
  - Reviews sheet
  - BusinessReviews sheet

### 2. Vote System Updates
- Modify `handleVote` function to:
  - Check if user has already voted for a business using their IP address
  - Prevent users from both liking and disliking the same business
  - Allow changing vote type (like to dislike or vice versa)

### 3. Review System Updates
- Modify `handleSubmitReview` and `handleSubmitBusinessReview` functions to:
  - Track IP addresses for all review submissions
  - Check daily review count per business per IP address
  - Enforce a limit of 5 reviews per business per day per IP address
  - Return appropriate error messages when limits are exceeded

### 4. Security Considerations
- Store IP addresses securely in the Google Sheet
- Use IP addresses only for rate limiting and preventing duplicate actions
- Do not expose IP addresses in API responses

## Frontend Implementation

### 1. Vote Service Updates
- Maintain the existing IP address implementation in `vote-service.ts`
- Update the service to follow the structure of `v-service.md`
- Ensure the `getVotes` and `vote` functions include:
  - Username from localStorage
  - IP address tracking
  - Proper error handling
  - CORS settings

### 2. Review Service Updates
- Maintain the existing IP address implementation in `review-service.ts`
- Update the service to follow the structure of `r-service.md`
- Ensure all review functions include:
  - Username from localStorage
  - IP address tracking
  - Timestamp generation
  - Proper error handling
  - CORS settings

## Testing Plan

### 1. Vote System Testing
- Test liking a business
- Test disliking a business
- Test attempting to both like and dislike the same business
- Test changing vote from like to dislike and vice versa

### 2. Review System Testing
- Test submitting reviews for products and businesses
- Test submitting multiple reviews (up to 5) for the same business in one day
- Test attempting to submit more than 5 reviews for the same business in one day
- Test submitting reviews for different businesses

### 3. Edge Cases
- Test behavior when IP address cannot be determined
- Test with different user accounts from the same IP address
- Test with the same user account from different IP addresses

## CORS Issue Resolution

### Backend Changes (Google Apps Script)
1. Modified the `doGet` and `doPost` functions to use a simpler approach for CORS compatibility
2. Removed `.setMimeType(ContentService.MimeType.JSON)` from response creation
3. Used only `ContentService.createTextOutput(JSON.stringify(response))` for all responses

### Frontend Changes
1. Updated `vote-service.ts` to use the simpler approach for fetch requests:
   - Removed `mode: 'cors'` and `credentials: 'omit'` options
   - Used `body: formData.toString()` for POST requests
2. Updated `review-service.ts` with the same changes for all fetch requests
3. Maintained IP address tracking functionality in all services

## Deployment

1. Update the Google Apps Script with the new implementation
2. Deploy as a web app with appropriate execution and access settings
3. Update frontend services to use the new API endpoints
4. Test the complete system end-to-end