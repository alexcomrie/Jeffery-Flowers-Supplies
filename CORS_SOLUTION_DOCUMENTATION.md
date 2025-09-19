# CORS Solution Documentation

## Overview

This document explains the implementation of a CORS-friendly approach for TheHub's Review and Rating system. The solution addresses cross-origin resource sharing (CORS) issues when communicating with the Google Apps Script backend.

## Problem

The original implementation encountered CORS errors when making direct API calls from the client to the Google Apps Script backend. This was due to:

1. The use of JSON data in POST requests, which triggered preflight OPTIONS requests
2. Google Apps Script's limited CORS support

## Solution

The solution implements a CORS-friendly approach by:

1. Using form-urlencoded data format instead of JSON for POST requests
2. Simplifying the Google Apps Script implementation to handle form-urlencoded data
3. Continuing to use Netlify's redirect functionality as a proxy

## Implementation Details

### 1. Client-Side Changes

#### Review Service (`review-service.ts`)

Changed the `submitReview` function to use form-urlencoded data:

```typescript
export async function submitReview(productId: string, review: Omit<ProductReview, 'id' | 'productId'>): Promise<ReviewResponse> {
  try {
    const url = new URL(REVIEW_API_URL);
    
    // Create form data using URLSearchParams for CORS-friendly requests
    const formData = new URLSearchParams();
    formData.append('action', 'submitReview');
    formData.append('productId', productId);
    
    // Add all review properties to form data
    Object.entries(review).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'cors',
      credentials: 'omit'
    });
```

#### Vote Service (`vote-service.ts`)

Changed the `vote` function to use form-urlencoded data and updated its signature:

```typescript
export async function vote(businessId: string, voteType: VoteType): Promise<VoteResponse> {
  try {
    const url = new URL(VOTE_API_URL);
    
    // Create form data using URLSearchParams for CORS-friendly requests
    const formData = new URLSearchParams();
    formData.append('action', 'vote');
    formData.append('businessId', businessId);
    formData.append('voteType', voteType);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'cors',
      credentials: 'omit'
    });
```

#### Vote Hook (`use-votes.ts`)

Updated the mutation function to match the new `vote` function signature:

```typescript
mutationFn: (voteData: BusinessVote) => vote(voteData.businessId, voteData.vote),
```

### 2. Google Apps Script Changes

The Google Apps Script implementation was updated to:

1. Focus on handling form-urlencoded data in the `doPost` function
2. Simplify response handling
3. Improve error handling and validation
4. Organize code into handler functions for better maintainability

Key changes include:

- Removed JSON parsing in favor of direct parameter access
- Simplified response creation
- Added more robust parameter validation
- Improved error messages

### 3. Netlify Configuration

The existing Netlify redirect configuration continues to proxy requests to the Google Apps Script backend:

```toml
[[redirects]]
  from = "/api/google-script/*"
  to = "https://script.google.com/macros/s/AKfycbzXttDdokt5xJjnkMvvvji7ibhl7z1HmOn91otBgTcYHsJdqCPYoeHg6YrWZV7U1kLz/exec/:splat"
  status = 200
  force = true
```

## How It Works

1. Client-side code creates form-urlencoded data using `URLSearchParams`
2. Requests are sent to the Netlify proxy endpoint `/api/google-script`
3. Netlify forwards the requests to the Google Apps Script backend
4. Google Apps Script processes the form-urlencoded data directly from `e.parameter`
5. Responses are returned as simple JSON without complex CORS headers
6. Netlify handles the CORS headers on the client side

## Benefits

1. **Avoids CORS Preflight**: Form-urlencoded requests don't trigger preflight OPTIONS requests for simple cases
2. **Simplified Backend**: The Google Apps Script code is more straightforward
3. **Improved Reliability**: Fewer potential points of failure
4. **Better Maintainability**: Code is organized into handler functions

## Deployment

1. Deploy the updated Google Apps Script code as a web app
2. Update the Netlify redirect rule with the new web app URL if needed
3. Deploy the client-side changes

## Testing

1. Test GET endpoints through the browser
2. Test POST endpoints through the application
3. Verify that no CORS errors occur in the browser console
4. Confirm that data is correctly stored in the Google Sheet