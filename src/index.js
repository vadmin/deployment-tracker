const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const { apiKeyAuth } = require('./middleware/authMiddleware');
require('./db'); // Initialize the database
require('./seed'); // Seed initial data

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Apply API key authentication to API routes
app.use(apiKeyAuth);

// API Routes
app.use('/api', apiRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Try accessing these URLs in your browser:`);
  console.log(`- http://localhost:${PORT}/health (health check)`);
  console.log(`- http://localhost:${PORT}/ (main application)`);
  console.log(`- http://127.0.0.1:${PORT}/health (alternative health check)`);
}); 