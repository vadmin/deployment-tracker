const { db } = require('./db');

// Sample applications
const applications = [
  { name: 'tsdsodspeims' },
  { name: 'tsdsportal' },
  { name: 'ccds-core' },
  { name: 'tsdspeimspromotionsfork' }
];

// Sample regions
const regions = [
  { name: 'DEV' },
  { name: 'TEST' },
  { name: 'PROD' },
  { name: 'TRN' }
];

// Function to seed applications
function seedApplications() {
  applications.forEach(app => {
    db.run('INSERT OR IGNORE INTO Applications (Name) VALUES (?)', [app.name], function(err) {
      if (err) {
        console.error(`Error inserting application ${app.name}:`, err.message);
      } else if (this.changes) {
        console.log(`Added application: ${app.name}`);
      }
    });
  });
}

// Function to seed regions
function seedRegions() {
  regions.forEach(region => {
    db.run('INSERT OR IGNORE INTO Regions (Name) VALUES (?)', [region.name], function(err) {
      if (err) {
        console.error(`Error inserting region ${region.name}:`, err.message);
      } else if (this.changes) {
        console.log(`Added region: ${region.name}`);
      }
    });
  });
}

// Wait for database to be initialized
setTimeout(() => {
  console.log('Seeding database with initial data...');
  seedApplications();
  seedRegions();
  console.log('Seeding completed');
}, 1000);

module.exports = {
  seedApplications,
  seedRegions
}; 