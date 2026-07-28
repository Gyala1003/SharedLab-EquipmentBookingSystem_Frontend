// scripts/open-browser.js
const open = require('open').default;
const config = require('./config');

(async () => {
  try {
    console.log(`🚀 [Automation] Opening default browser at: ${config.CLIENT_URL}`);
    
    await open(config.CLIENT_URL, { newState: true });
    
    console.log('✅ [Automation] Browser opened successfully!');
    console.log('💡 [Tip] Press CTRL + C to stop all processes.');

    // Keep the process alive so concurrently doesn't terminate early
    process.stdin.resume();

  } catch (error) {
    console.error('❌ [Automation] Failed to open browser:', error.message);
  }
})();