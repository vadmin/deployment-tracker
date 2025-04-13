const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// Use a file path that works in both Docker and local environments
const dbPath = process.env.DB_PATH 
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../data/deployments.db');
console.log(`Using database at path: ${dbPath}`);

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database at', dbPath);
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  console.log('Initializing database tables...');
  
  // Create Applications table
  db.run(`CREATE TABLE IF NOT EXISTS Applications (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT UNIQUE NOT NULL
  )`, (err) => {
    if (err) console.error('Error creating Applications table:', err.message);
    else console.log('Applications table created or already exists');
  });

  // Create Regions table
  db.run(`CREATE TABLE IF NOT EXISTS Regions (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT UNIQUE NOT NULL
  )`, (err) => {
    if (err) console.error('Error creating Regions table:', err.message);
    else console.log('Regions table created or already exists');
  });

  // Create Deployments table
  db.run(`CREATE TABLE IF NOT EXISTS Deployments (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Application_ID INTEGER NOT NULL,
    Region_ID INTEGER NOT NULL,
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Deployment_Result TEXT NOT NULL,
    Application_Tag TEXT,
    FOREIGN KEY (Application_ID) REFERENCES Applications(ID),
    FOREIGN KEY (Region_ID) REFERENCES Regions(ID)
  )`, (err) => {
    if (err) console.error('Error creating Deployments table:', err.message);
    else console.log('Deployments table created or already exists');
  });

  // Create ApiKeys table
  db.run(`CREATE TABLE IF NOT EXISTS ApiKeys (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    KeyName TEXT NOT NULL,
    ApiKey TEXT UNIQUE NOT NULL,
    Created DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastUsed DATETIME,
    Active INTEGER DEFAULT 1
  )`, (err) => {
    if (err) console.error('Error creating ApiKeys table:', err.message);
    else {
      console.log('ApiKeys table created or already exists');
      createDefaultApiKey();
    }
  });

  // Create indexes for better query performance
  db.run('CREATE INDEX IF NOT EXISTS idx_deployments_app_id ON Deployments(Application_ID)', (err) => {
    if (err) console.error('Error creating index on Application_ID:', err.message);
  });
  
  db.run('CREATE INDEX IF NOT EXISTS idx_deployments_region_id ON Deployments(Region_ID)', (err) => {
    if (err) console.error('Error creating index on Region_ID:', err.message);
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_api_keys ON ApiKeys(ApiKey)', (err) => {
    if (err) console.error('Error creating index on ApiKey:', err.message);
  });
}

// Create a default API key if none exists
function createDefaultApiKey() {
  db.get('SELECT COUNT(*) as count FROM ApiKeys', (err, row) => {
    if (err) {
      console.error('Error checking for API keys:', err.message);
      return;
    }
    
    if (row.count === 0) {
      // Generate a random API key
      const apiKey = crypto.randomBytes(32).toString('hex');
      
      db.run('INSERT INTO ApiKeys (KeyName, ApiKey) VALUES (?, ?)', ['Default Key', apiKey], function(err) {
        if (err) {
          console.error('Error creating default API key:', err.message);
        } else {
          console.log(`Default API key created successfully. Key: ${apiKey}`);
        }
      });
    }
  });
}

// Helper function to validate an API key
function validateApiKey(apiKey, callback) {
  if (!apiKey) {
    console.log('No API key provided');
    return callback(false);
  }
  
  db.get('SELECT * FROM ApiKeys WHERE ApiKey = ? AND Active = 1', [apiKey], (err, row) => {
    if (err) {
      console.error('Error validating API key:', err.message);
      return callback(false);
    }
    
    if (row) {
      console.log(`API key validated successfully: ${apiKey.substring(0, 8)}...`);
      // Update last used timestamp
      db.run('UPDATE ApiKeys SET LastUsed = CURRENT_TIMESTAMP WHERE ID = ?', [row.ID]);
      return callback(true);
    } else {
      console.log(`Invalid API key: ${apiKey.substring(0, 8)}...`);
      return callback(false);
    }
  });
}

// Get all API keys
function getAllApiKeys(callback) {
  db.all('SELECT ID, KeyName, ApiKey, Created, LastUsed, Active FROM ApiKeys', (err, rows) => {
    if (err) {
      console.error('Error getting API keys:', err.message);
      return callback(err);
    }
    callback(null, rows);
  });
}

// Create a new API key
function createApiKey(keyName, callback) {
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  db.run('INSERT INTO ApiKeys (KeyName, ApiKey) VALUES (?, ?)', [keyName, apiKey], function(err) {
    if (err) {
      console.error('Error creating API key:', err.message);
      return callback(err);
    }
    
    callback(null, { id: this.lastID, keyName, apiKey });
  });
}

// Toggle API key status (activate/deactivate)
function toggleApiKeyStatus(keyId, active, callback) {
  db.run('UPDATE ApiKeys SET Active = ? WHERE ID = ?', [active ? 1 : 0, keyId], function(err) {
    if (err) {
      console.error('Error updating API key status:', err.message);
      return callback(err);
    }
    
    callback(null, { affected: this.changes });
  });
}

// Delete an API key
function deleteApiKey(keyId, callback) {
  db.run('DELETE FROM ApiKeys WHERE ID = ?', [keyId], function(err) {
    if (err) {
      console.error('Error deleting API key:', err.message);
      return callback(err);
    }
    
    callback(null, { affected: this.changes });
  });
}

module.exports = {
  db,
  validateApiKey,
  getAllApiKeys,
  createApiKey,
  toggleApiKeyStatus,
  deleteApiKey
};
