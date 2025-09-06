#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Book Explorer Application Test');
console.log('================================\n');

// Test function to run commands
function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    
    const process = spawn(command, args, {
      cwd: cwd,
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} - Success`);
        resolve(output);
      } else {
        console.log(`❌ ${description} - Failed`);
        console.log(`Error: ${error}`);
        reject(new Error(error));
      }
    });

    // Set timeout for commands
    setTimeout(() => {
      process.kill();
      reject(new Error('Command timeout'));
    }, 30000);
  });
}

async function testApplication() {
  try {
    // Test 1: Check if all package.json files exist
    console.log('📦 Checking project structure...');
    const fs = require('fs');
    
    const requiredFiles = [
      'backend/package.json',
      'frontend/package.json',
      'scraper/package.json',
      'backend/server.js',
      'frontend/src/App.tsx',
      'scraper/scraper.js'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        throw new Error(`Required file ${file} is missing`);
      }
    }

    // Test 2: Check if dependencies are installed
    console.log('\n📦 Checking dependencies...');
    
    try {
      await runCommand('npm', ['list', '--depth=0'], path.join(__dirname, 'backend'), 'Backend dependencies');
    } catch (err) {
      console.log('⚠️  Backend dependencies not installed. Run: cd backend && npm install');
    }

    try {
      await runCommand('npm', ['list', '--depth=0'], path.join(__dirname, 'frontend'), 'Frontend dependencies');
    } catch (err) {
      console.log('⚠️  Frontend dependencies not installed. Run: cd frontend && npm install');
    }

    try {
      await runCommand('npm', ['list', '--depth=0'], path.join(__dirname, 'scraper'), 'Scraper dependencies');
    } catch (err) {
      console.log('⚠️  Scraper dependencies not installed. Run: cd scraper && npm install');
    }

    // Test 3: Check TypeScript compilation
    console.log('\n🔧 Checking TypeScript compilation...');
    try {
      await runCommand('npx', ['tsc', '--noEmit'], path.join(__dirname, 'frontend'), 'TypeScript compilation');
    } catch (err) {
      console.log('⚠️  TypeScript compilation issues found. Check the errors above.');
    }

    // Test 4: Check if environment files exist
    console.log('\n🔧 Checking environment configuration...');
    const envFiles = [
      'backend/env.example',
      'frontend/env.example',
      'scraper/env.example'
    ];

    for (const file of envFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
      }
    }

    console.log('\n🎉 Application structure test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: cd backend && npm install');
    console.log('2. Install dependencies: cd frontend && npm install');
    console.log('3. Install dependencies: cd scraper && npm install');
    console.log('4. Set up environment variables (copy env.example to .env)');
    console.log('5. Configure MongoDB Atlas connection');
    console.log('6. Run the scraper: cd scraper && npm start');
    console.log('7. Start the backend: cd backend && npm run dev');
    console.log('8. Start the frontend: cd frontend && npm run dev');
    console.log('\n📖 See setup.md for detailed instructions');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testApplication();

