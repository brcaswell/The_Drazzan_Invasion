// Script to install optional dependencies for enhanced desktop features
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const optionalDependencies = [
  {
    name: 'node-datachannel',
    description: 'Enhanced WebRTC with native performance',
    platforms: ['win32', 'darwin', 'linux'],
    required: false
  },
  {
    name: 'webtorrent-desktop',
    description: 'BitTorrent-based peer discovery',
    platforms: ['win32', 'darwin', 'linux'],
    required: false
  },
  {
    name: 'mdns-js',
    description: 'Local network discovery (mDNS/Bonjour)',
    platforms: ['win32', 'darwin', 'linux'],
    required: false
  },
  {
    name: 'node-notifier',
    description: 'Enhanced system notifications',
    platforms: ['win32', 'darwin', 'linux'],
    required: false
  }
];

async function installOptionalDependency(dep) {
  if (!dep.platforms.includes(process.platform)) {
    console.log(`⏭️  Skipping ${dep.name} (not available on ${process.platform})`);
    return { name: dep.name, status: 'skipped', reason: 'platform' };
  }

  try {
    console.log(`📦 Installing ${dep.name}...`);
    await execAsync(`npm install ${dep.name}`, { timeout: 120000 });
    console.log(`✅ Successfully installed ${dep.name}`);
    return { name: dep.name, status: 'success' };
  } catch (error) {
    console.log(`❌ Failed to install ${dep.name}: ${error.message}`);
    
    if (dep.required) {
      throw new Error(`Required dependency ${dep.name} failed to install`);
    }
    
    return { name: dep.name, status: 'failed', error: error.message };
  }
}

async function main() {
  console.log('🚀 Installing optional dependencies for enhanced desktop features...\n');
  
  const results = [];
  
  for (const dep of optionalDependencies) {
    const result = await installOptionalDependency(dep);
    results.push(result);
  }
  
  console.log('\n📊 Installation Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.name}`));
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  }
  
  if (skipped.length > 0) {
    console.log(`⏭️  Skipped: ${skipped.length}`);
    skipped.forEach(r => console.log(`   - ${r.name} (${r.reason})`));
  }
  
  console.log('\n💡 Note: Failed optional dependencies will not prevent the app from running.');
  console.log('   Enhanced features will be disabled if dependencies are not available.\n');
  
  // Create a feature flag file
  const features = {
    enhancedWebRTC: successful.some(r => r.name === 'node-datachannel'),
    bitTorrentDiscovery: successful.some(r => r.name === 'webtorrent-desktop'),
    localNetworkDiscovery: successful.some(r => r.name === 'mdns-js'),
    enhancedNotifications: successful.some(r => r.name === 'node-notifier'),
    lastChecked: new Date().toISOString()
  };
  
  const fs = require('fs').promises;
  await fs.writeFile(
    '../src/features.json', 
    JSON.stringify(features, null, 2)
  );
  
  console.log('📝 Feature flags written to src/features.json');
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Installation failed:', error);
    process.exit(1);
  });
}

module.exports = { installOptionalDependency, optionalDependencies };