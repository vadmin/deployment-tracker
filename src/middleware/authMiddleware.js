const { validateApiKey } = require('../db');

// API Key authentication middleware
const apiKeyAuth = (req, res, next) => {
  // Check if path is exempt from authentication
  if (isExemptPath(req.path)) {
    console.log(`Path exempt from auth: ${req.path}`);
    return next();
  }

  // Get API key from header or query parameter
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  console.log(`Auth request for path: ${req.path}, API key provided: ${apiKey ? 'Yes' : 'No'}`);

  // Validate the API key
  validateApiKey(apiKey, (isValid) => {
    if (isValid) {
      console.log(`Authentication successful for: ${req.path}`);
      next();
    } else {
      console.log(`Authentication failed for: ${req.path}`);
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or missing API key'
      });
    }
  });
};

// Check if the path is exempt from API key authentication
function isExemptPath(path) {
  const exemptPaths = [
    '/health',
    '/',
    '/styles.css',
    '/admin/login',
    '/api/admin' // Exempt admin API routes
  ];

  // Check if path exactly matches or starts with an exempt path
  const isExempt = exemptPaths.some(exemptPath => 
    path === exemptPath || 
    path.startsWith(`${exemptPath}/`) ||
    path.endsWith('.html') ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.ico')
  );

  return isExempt;
}

module.exports = {
  apiKeyAuth
}; 