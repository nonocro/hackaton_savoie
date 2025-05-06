const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting diagnosis of Playwright timeout issues...');

// Check for port conflicts
exec('lsof -i :3000', (err, stdout) => {
  console.log('--- PORT 3000 STATUS ---');
  if (stdout) {
    console.log('Port 3000 is already in use:');
    console.log(stdout);
    console.log('This might cause conflicts with the test server.');
  } else {
    console.log('Port 3000 is available.');
  }
  
  // Check for environment variables
  console.log('\n--- ENVIRONMENT VARIABLES ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VITE_BACKEND_URL:', process.env.VITE_BACKEND_URL);
  
  // Check node version
  exec('node -v', (err, stdout) => {
    console.log('\n--- NODE VERSION ---');
    console.log(stdout.trim());
    
    // Check npm dependencies
    console.log('\n--- CHECKING DEPENDENCIES ---');
    const packageJsonPath = path.join(__dirname, 'hackathon_front', 'package.json');
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log('Found dependencies:');
      console.log('- @playwright/test:', packageJson.devDependencies?.['@playwright/test'] || 'Not found');
      
      // Check for potential issues
      console.log('\n--- POTENTIAL ISSUES ---');
      if (!packageJson.devDependencies?.['@playwright/test']) {
        console.log('⚠️ Playwright is not in devDependencies, run: npm install -D @playwright/test');
      }
      
      // Check package scripts
      console.log('\n--- PACKAGE SCRIPTS ---');
      console.log(packageJson.scripts || 'No scripts defined');
      
      // Suggest next steps
      console.log('\n--- SUGGESTIONS ---');
      console.log('1. Run the development server separately: cd hackathon_front && npm run dev');
      console.log('2. In another terminal, run: npx playwright test tests/debug.spec.ts --headed');
      console.log('3. Check test-results directory for screenshots and traces');
      console.log('4. Increase timeouts in playwright.config.ts if needed');
    } catch (e) {
      console.error('Error reading package.json:', e);
    }
  });
});
