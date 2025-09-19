/**
 * Initialize the script
 */
function initialize() {
  try {
    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create sheets if they don't exist
    createSheetIfNotExists(ss, 'Votes');
    createSheetIfNotExists(ss, 'Reviews');
    createSheetIfNotExists(ss, 'Meta');
    
    // Create named ranges if they don't exist
    createNamedRangeIfNotExists(ss, 'Votes', 'Votes!A1:E1000');
    createNamedRangeIfNotExists(ss, 'Reviews', 'Reviews!A1:F1000');
    createNamedRangeIfNotExists(ss, 'Meta', 'Meta!A1:B1000');
    
    // Initialize headers if needed
    initializeHeaders(ss);
    
    return true;
  } catch (e) {
    console.error('Initialization error:', e);
    return false;
  }
}

/**
 * Create a sheet if it doesn't exist
 */
function createSheetIfNotExists(ss, sheetName) {
  if (!ss.getSheetByName(sheetName)) {
    ss.insertSheet(sheetName);
  }
}

/**
 * Create a named range if it doesn't exist
 */
function createNamedRangeIfNotExists(ss, rangeName, rangeA1Notation) {
  const namedRanges = ss.getNamedRanges();
  let rangeExists = false;
  
  for (let i = 0; i < namedRanges.length; i++) {
    if (namedRanges[i].getName() === rangeName) {
      rangeExists = true;
      break;
    }
  }
  
  if (!rangeExists) {
    const range = ss.getRange(rangeA1Notation);
    ss.setNamedRange(rangeName, range);
  }
}

/**
 * Initialize headers for sheets
 */
function initializeHeaders(ss) {
  // Votes sheet headers
  const votesSheet = ss.getSheetByName('Votes');
  if (votesSheet.getRange('A1').getValue() === '') {
    votesSheet.getRange('A1:E1').setValues([['BusinessID', 'Username', 'VoteType', 'Timestamp', 'IP']]);
  }
  
  // Reviews sheet headers
  const reviewsSheet = ss.getSheetByName('Reviews');
  if (reviewsSheet.getRange('A1').getValue() === '') {
    reviewsSheet.getRange('A1:F1').setValues([['ProductID', 'Username', 'Rating', 'ReviewText', 'Timestamp', 'IP']]);
  }
  
  // Meta sheet headers
  const metaSheet = ss.getSheetByName('Meta');
  if (metaSheet.getRange('A1').getValue() === '') {
    metaSheet.getRange('A1:B1').setValues([['Key', 'Value']]);
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://the-hubja.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
  };
  
  return HtmlService.createHtmlOutput('')
    .addHeader('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .addHeader('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .addHeader('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .addHeader('Access-Control-Max-Age', headers['Access-Control-Max-Age']);
}

/**
 * Web app doGet handler - handles GET requests
 */
function doGet(e) {
  try {
    // Define headers
    const headers = {};
    
    // Initialize sheets
    if (!initialize()) {
      return sendResponse(false, 'Failed to initialize', {}, headers);
    }
    
    // Get action parameter
    const action = e.parameter.action;
    
    if (!action) {
      return sendResponse(false, 'No action specified', {}, headers);
    }
    
    // Route to appropriate handler
    switch (action) {
      case 'checkUsername':
        return handleCheckUsername(e.parameter.username, headers);
      case 'getVotes':
        return handleGetVotes(e.parameter.businessId, e.parameter.username, headers);
      case 'getReviews':
        return handleGetReviews(e.parameter.productId, e.parameter.username, headers);
      case 'getReviewSummary':
        return handleGetReviewSummary(e.parameter.productId, headers);
      default:
        return sendResponse(false, 'Invalid action', {}, headers);
    }
  } catch (e) {
    console.error('doGet error:', e);
    return sendResponse(false, 'Server error', {}, {});
  }
}

/**
 * Web app doPost handler - handles POST requests
 */
function doPost(e) {
  try {
    // Define headers
    const headers = {};
    
    // Initialize sheets
    if (!initialize()) {
      return sendResponse(false, 'Failed to initialize', {}, headers);
    }
    
    // Parse request body
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (e) {
      return sendResponse(false, 'Invalid JSON', {}, headers);
    }
    
    // Get action
    const action = data.action;
    
    if (!action) {
      return sendResponse(false, 'No action specified', {}, headers);
    }
    
    // Route to appropriate handler
    switch (action) {
      case 'createUsername':
        return handleCreateUsername(data.username, headers);
      case 'vote':
        return handleVote(data.businessId, data.username, data.voteType, headers);
      case 'submitReview':
        return handleSubmitReview(data.productId, data.username, data.rating, data.reviewText, headers);
      default:
        return sendResponse(false, 'Invalid action', {}, headers);
    }
  } catch (e) {
    console.error('doPost error:', e);
    return sendResponse(false, 'Server error', {}, {});
  }
}

/**
 * Handle check username action
 */
function handleCheckUsername(username, headers = {}) {
  if (!username) {
    return sendResponse(false, 'Username is required', {}, headers);
  }
  
  const exists = usernameExists(username);
  return sendResponse(true, exists ? 'Username exists' : 'Username does not exist', { exists }, headers);
}

/**
 * Handle create username action
 */
function handleCreateUsername(username, headers = {}) {
  if (!username) {
    return sendResponse(false, 'Username is required', {}, headers);
  }
  
  if (usernameExists(username)) {
    return sendResponse(false, 'Username already exists', {}, headers);
  }
  
  // Add username to Meta sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metaSheet = ss.getSheetByName('Meta');
  const lastRow = metaSheet.getLastRow();
  metaSheet.getRange(lastRow + 1, 1, 1, 2).setValues([['username_' + username, 'true']]);
  
  return sendResponse(true, 'Username created successfully', {}, headers);
}

/**
 * Handle get votes action
 */
function handleGetVotes(businessId, username, headers = {}) {
  if (!businessId) {
    return sendResponse(false, 'Business ID is required', {}, headers);
  }
  
  const votes = getVotesForBusiness(businessId);
  const userVote = username ? getUserVoteForBusiness(businessId, username) : null;
  
  return sendResponse(true, 'Votes retrieved successfully', {
    votes: {
      businessId: businessId,
      likes: votes.likes,
      dislikes: votes.dislikes,
      userVote: userVote
    }
  }, headers);
}

/**
 * Handle vote action
 */
function handleVote(businessId, username, voteType, headers = {}) {
  if (!businessId) {
    return sendResponse(false, 'Business ID is required', {}, headers);
  }
  
  if (!username) {
    return sendResponse(false, 'Username is required', {}, headers);
  }
  
  if (!voteType || (voteType !== 'like' && voteType !== 'dislike' && voteType !== 'remove')) {
    return sendResponse(false, 'Invalid vote type', {}, headers);
  }
  
  // Get the active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const votesSheet = ss.getSheetByName('Votes');
  
  // Check if user already voted for this business
  const data = votesSheet.getDataRange().getValues();
  let existingVoteRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === businessId && data[i][1] === username) {
      existingVoteRow = i + 1; // +1 because array is 0-indexed but sheet is 1-indexed
      break;
    }
  }
  
  // If removing vote
  if (voteType === 'remove') {
    if (existingVoteRow > 0) {
      votesSheet.deleteRow(existingVoteRow);
    }
  } else {
    // If updating existing vote
    if (existingVoteRow > 0) {
      votesSheet.getRange(existingVoteRow, 3).setValue(voteType);
      votesSheet.getRange(existingVoteRow, 4).setValue(new Date());
    } else {
      // If adding new vote
      const lastRow = votesSheet.getLastRow();
      votesSheet.getRange(lastRow + 1, 1, 1, 5).setValues([
        [businessId, username, voteType, new Date(), '']
      ]);
    }
  }
  
  // Get updated votes
  const votes = getVotesForBusiness(businessId);
  const userVote = voteType === 'remove' ? null : voteType;
  
  return sendResponse(true, 'Vote recorded successfully', {
    votes: {
      businessId: businessId,
      likes: votes.likes,
      dislikes: votes.dislikes,
      userVote: userVote
    }
  }, headers);
}

/**
 * Handle get reviews action
 */
function handleGetReviews(productId, username, headers = {}) {
  if (!productId) {
    return sendResponse(false, 'Product ID is required', {}, headers);
  }
  
  const reviews = getReviewsForProduct(productId);
  
  // Check if user has already reviewed this product
  let userReview = null;
  if (username) {
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].username === username) {
        userReview = reviews[i];
        break;
      }
    }
  }
  
  return sendResponse(true, 'Reviews retrieved successfully', {
    reviews: reviews,
    userReview: userReview
  }, headers);
}

/**
 * Handle get review summary action
 */
function handleGetReviewSummary(productId, headers = {}) {
  if (!productId) {
    return sendResponse(false, 'Product ID is required', {}, headers);
  }
  
  const reviews = getReviewsForProduct(productId);
  
  // Calculate average rating
  let totalRating = 0;
  for (let i = 0; i < reviews.length; i++) {
    totalRating += reviews[i].rating;
  }
  
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  // Count ratings by star
  const ratingCounts = [0, 0, 0, 0, 0]; // 1-5 stars
  for (let i = 0; i < reviews.length; i++) {
    const rating = reviews[i].rating;
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  }
  
  return sendResponse(true, 'Review summary retrieved successfully', {
    summary: {
      productId: productId,
      averageRating: averageRating,
      totalReviews: reviews.length,
      ratingCounts: ratingCounts
    }
  }, headers);
}

/**
 * Handle submit review action
 */
function handleSubmitReview(productId, username, rating, reviewText, headers = {}) {
  if (!productId) {
    return sendResponse(false, 'Product ID is required', {}, headers);
  }
  
  if (!username) {
    return sendResponse(false, 'Username is required', {}, headers);
  }
  
  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    return sendResponse(false, 'Rating must be between 1 and 5', {}, headers);
  }
  
  // Get the active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewsSheet = ss.getSheetByName('Reviews');
  
  // Check if user already reviewed this product
  const data = reviewsSheet.getDataRange().getValues();
  let existingReviewRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId && data[i][1] === username) {
      existingReviewRow = i + 1; // +1 because array is 0-indexed but sheet is 1-indexed
      break;
    }
  }
  
  // If updating existing review
  if (existingReviewRow > 0) {
    reviewsSheet.getRange(existingReviewRow, 3).setValue(rating);
    reviewsSheet.getRange(existingReviewRow, 4).setValue(reviewText);
    reviewsSheet.getRange(existingReviewRow, 5).setValue(new Date());
  } else {
    // If adding new review
    const lastRow = reviewsSheet.getLastRow();
    reviewsSheet.getRange(lastRow + 1, 1, 1, 6).setValues([
      [productId, username, rating, reviewText, new Date(), '']
    ]);
  }
  
  // Get updated review
  const review = {
    productId: productId,
    username: username,
    rating: rating,
    reviewText: reviewText,
    timestamp: new Date().toISOString()
  };
  
  return sendResponse(true, 'Review submitted successfully', { review }, headers);
}

/**
 * Send a JSON response
 */
function sendResponse(success, message, data = {}, headers = {}) {
  const response = {
    success: success,
    message: message,
    ...data
  };
  
  const output = ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  output.addHeader('Access-Control-Allow-Origin', 'https://the-hubja.netlify.app');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Add any additional headers
  for (const [key, value] of Object.entries(headers)) {
    output.addHeader(key, value);
  }
  
  return output;
}

/**
 * Check if username exists
 */
function usernameExists(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metaSheet = ss.getSheetByName('Meta');
  const data = metaSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'username_' + username && data[i][1] === 'true') {
      return true;
    }
  }
  
  return false;
}

/**
 * Get votes for a business
 */
function getVotesForBusiness(businessId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const votesSheet = ss.getSheetByName('Votes');
  const data = votesSheet.getDataRange().getValues();
  
  let likes = 0;
  let dislikes = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === businessId) {
      if (data[i][2] === 'like') {
        likes++;
      } else if (data[i][2] === 'dislike') {
        dislikes++;
      }
    }
  }
  
  return { likes, dislikes };
}

/**
 * Get user vote for a business
 */
function getUserVoteForBusiness(businessId, username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const votesSheet = ss.getSheetByName('Votes');
  const data = votesSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === businessId && data[i][1] === username) {
      return data[i][2];
    }
  }
  
  return null;
}

/**
 * Get reviews for a product
 */
function getReviewsForProduct(productId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reviewsSheet = ss.getSheetByName('Reviews');
  const data = reviewsSheet.getDataRange().getValues();
  
  const reviews = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      reviews.push({
        productId: data[i][0],
        username: data[i][1],
        rating: data[i][2],
        reviewText: data[i][3],
        timestamp: data[i][4].toISOString()
      });
    }
  }
  
  return reviews;
}

/*
 * Deployment Instructions:
 * 
 * 1. Click on Deploy > New deployment
 * 2. Select type: Web app
 * 3. Set the following:
 *    - Description: TheHub Reviews and Ratings API
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Click Deploy
 * 5. Copy the web app URL
 * 6. Update the client-side code to use this URL
 */