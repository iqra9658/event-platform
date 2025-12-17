#!/usr/bin/env node

/**
 * MongoDB URI Generator
 * Usage: node generate-mongo-uri.js
 * 
 * Creates a .env.local file with MongoDB connection string
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  'MongoDB Username: ',
  'MongoDB Password: ',
  'MongoDB Cluster URL (e.g., cluster0.xxxxx.mongodb.net): ',
  'Database Name (default: event_platform): '
];

let answers = [];

function askQuestion(index) {
  if (index < questions.length) {
    rl.question(questions[index], (answer) => {
      answers.push(answer);
      askQuestion(index + 1);
    });
  } else {
    rl.close();
    generateURI();
  }
}

function generateURI() {
  const username = answers[0];
  const password = encodeURIComponent(answers[1]); // URL encode password
  const cluster = answers[2];
  const dbName = answers[3] || 'event_platform';
  
  const mongoURI = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
  
  // Generate JWT Secret
  const jwtSecret = Array.from({length: 32}, () => 
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('');
  
  const envContent = `MONGODB_URI=${mongoURI}
JWT_SECRET=${jwtSecret}
NODE_ENV=production
PORT=5000`;
  
  const serverEnvPath = path.join(__dirname, 'server', '.env.local');
  fs.writeFileSync(serverEnvPath, envContent);
  
  console.log('\n✅ Created server/.env.local');
  console.log('\nEnvironment Variables:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`MONGODB_URI=${mongoURI}`);
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log('NODE_ENV=production');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nNext steps:');
  console.log('1. Copy MONGODB_URI and JWT_SECRET above');
  console.log('2. Add these to Render environment variables');
  console.log('3. Deploy to Render');
}

console.log('MongoDB Connection String Generator');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
askQuestion(0);
