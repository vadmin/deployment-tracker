const express = require('express');
const router = express.Router();
const { db, getAllApiKeys, createApiKey, toggleApiKeyStatus, deleteApiKey } = require('../db');

// Get all API keys
router.get('/keys', (req, res) => {
  getAllApiKeys((err, keys) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve API keys' });
    }
    
    // Mask the actual API keys for security
    const maskedKeys = keys.map(key => ({
      ...key,
      ApiKey: key.ApiKey ? `${key.ApiKey.substring(0, 8)}...${key.ApiKey.substring(key.ApiKey.length - 8)}` : null
    }));
    
    res.json(maskedKeys);
  });
});

// Get full API key (for copy function)
router.get('/keys/:id/full', (req, res) => {
  const keyId = req.params.id;
  
  db.get('SELECT ApiKey FROM ApiKeys WHERE ID = ?', [keyId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve API key' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ apiKey: row.ApiKey });
  });
});

// Create a new API key
router.post('/keys', (req, res) => {
  const { keyName } = req.body;
  
  if (!keyName) {
    return res.status(400).json({ error: 'Key name is required' });
  }
  
  createApiKey(keyName, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create API key' });
    }
    
    res.status(201).json({
      message: 'API key created successfully',
      key: result
    });
  });
});

// Toggle an API key's active status
router.put('/keys/:id/toggle', (req, res) => {
  const keyId = req.params.id;
  const { active } = req.body;
  
  if (active === undefined) {
    return res.status(400).json({ error: 'Active status is required' });
  }
  
  toggleApiKeyStatus(keyId, active, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update API key' });
    }
    
    if (result.affected === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({
      message: active ? 'API key activated' : 'API key deactivated'
    });
  });
});

// Delete an API key
router.delete('/keys/:id', (req, res) => {
  const keyId = req.params.id;
  
  deleteApiKey(keyId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete API key' });
    }
    
    if (result.affected === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ message: 'API key deleted successfully' });
  });
});

module.exports = router; 