const express = require('express');
const router = express.Router();
const { db } = require('./db');

// POST endpoint to create a new deployment
router.post('/deployments', (req, res) => {
  const { applicationId, regionId, date, time, result, tag } = req.body;
  
  if (!applicationId || !regionId || !date || !time || !result) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Deployments (Application_ID, Region_ID, Date, Time, Deployment_Result, Application_Tag)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [applicationId, regionId, date, time, result, tag], function(err) {
    if (err) {
      console.error('Error creating deployment:', err.message);
      return res.status(500).json({ error: 'Failed to create deployment' });
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Deployment created successfully' 
    });
  });
});

// GET endpoint to retrieve all deployments
router.get('/deployments', (req, res) => {
  const sql = `
    SELECT d.ID, a.Name as Application, r.Name as Region, d.Date, d.Time, 
           d.Deployment_Result, d.Application_Tag
    FROM Deployments d
    JOIN Applications a ON d.Application_ID = a.ID
    JOIN Regions r ON d.Region_ID = r.ID
    ORDER BY d.Date DESC, d.Time DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving deployments:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve deployments' });
    }
    
    res.json(rows);
  });
});

// GET endpoint to retrieve deployments by application
router.get('/deployments/application/:id', (req, res) => {
  const applicationId = req.params.id;
  
  const sql = `
    SELECT d.ID, a.Name as Application, r.Name as Region, d.Date, d.Time, 
           d.Deployment_Result, d.Application_Tag
    FROM Deployments d
    JOIN Applications a ON d.Application_ID = a.ID
    JOIN Regions r ON d.Region_ID = r.ID
    WHERE d.Application_ID = ?
    ORDER BY d.Date DESC, d.Time DESC
  `;

  db.all(sql, [applicationId], (err, rows) => {
    if (err) {
      console.error('Error retrieving deployments by application:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve deployments' });
    }
    
    res.json(rows);
  });
});

// GET endpoint to retrieve deployments by region
router.get('/deployments/region/:id', (req, res) => {
  const regionId = req.params.id;
  
  const sql = `
    SELECT d.ID, a.Name as Application, r.Name as Region, d.Date, d.Time, 
           d.Deployment_Result, d.Application_Tag
    FROM Deployments d
    JOIN Applications a ON d.Application_ID = a.ID
    JOIN Regions r ON d.Region_ID = r.ID
    WHERE d.Region_ID = ?
    ORDER BY d.Date DESC, d.Time DESC
  `;

  db.all(sql, [regionId], (err, rows) => {
    if (err) {
      console.error('Error retrieving deployments by region:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve deployments' });
    }
    
    res.json(rows);
  });
});

// GET endpoint to retrieve applications
router.get('/applications', (req, res) => {
  db.all('SELECT * FROM Applications', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving applications:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve applications' });
    }
    
    res.json(rows);
  });
});

// POST endpoint to create a new application
router.post('/applications', (req, res) => {
  const { Name, Description } = req.body;
  
  if (!Name) {
    return res.status(400).json({ error: 'Application name is required' });
  }

  // Check if application with this name already exists
  db.get('SELECT * FROM Applications WHERE Name = ?', [Name], (err, row) => {
    if (err) {
      console.error('Error checking application:', err.message);
      return res.status(500).json({ error: 'Failed to check application' });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Application with this name already exists' });
    }
    
    // Check if Description column exists
    db.all(`PRAGMA table_info(Applications)`, [], (err, columns) => {
      if (err) {
        console.error('Error checking table schema:', err.message);
        return res.status(500).json({ error: 'Failed to check table schema' });
      }
      
      const hasDescription = columns && columns.some(col => col.name === 'Description');
      
      if (!hasDescription) {
        // Try to add Description column, but don't fail if it already exists
        db.run('ALTER TABLE Applications ADD COLUMN Description TEXT', [], (err) => {
          if (err) {
            console.error('Error adding Description column:', err.message);
            // Continue anyway, as the column might already exist
          }
          insertApplication();
        });
      } else {
        insertApplication();
      }
    });
    
    function insertApplication() {
      const sql = 'INSERT INTO Applications (Name, Description) VALUES (?, ?)';
      
      db.run(sql, [Name, Description || null], function(err) {
        if (err) {
          console.error('Error creating application:', err.message);
          return res.status(500).json({ error: 'Failed to create application' });
        }
        
        db.get('SELECT * FROM Applications WHERE ID = ?', [this.lastID], (err, application) => {
          if (err) {
            console.error('Error retrieving created application:', err.message);
            return res.status(500).json({ error: 'Application created but failed to retrieve details' });
          }
          
          res.status(201).json(application);
        });
      });
    }
  });
});

// GET endpoint to retrieve regions
router.get('/regions', (req, res) => {
  db.all('SELECT * FROM Regions', [], (err, rows) => {
    if (err) {
      console.error('Error retrieving regions:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve regions' });
    }
    
    res.json(rows);
  });
});

module.exports = router;
