// MongoDB initialization script for OAuth demo
db = db.getSiblingDB("oauth_demo");

// Create collections
db.createCollection("sessions");
db.createCollection("users");

// Create indexes for better performance
db.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ session_id: 1 }, { unique: true });

// Create user indexes
db.users.createIndex({ provider_id: 1, provider: 1 }, { unique: true });
db.users.createIndex({ email: 1 });

print("Database initialized successfully");
