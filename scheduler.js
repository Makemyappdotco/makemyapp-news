#!/usr/bin/env node

/**
 * MMA NEWS ENGINE — Background Scheduler
 * Runs generate.js every day at 9 AM IST (3:30 AM UTC)
 *
 * Start: node scheduler.js
 * Stop:  Ctrl+C or kill the PID
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GENERATE = path.join(__dirname, 'generate.js');
const LOG = path.join(__dirname, 'scheduler.log');

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG, line);
}

// Get IST time
function istNow() {
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + offset);
}

function msUntil9AM() {
  const ist = istNow();
  const nowMins = ist.getHours() * 60 + ist.getMinutes();
  let diff = (9 * 60) - nowMins; // 9:00 AM
  if (diff <= 0) diff += 24 * 60;
  return diff * 60 * 1000;
}

function run() {
  log('🚀 Running daily generation...');
  try {
    const out = execSync(`node "${GENERATE}"`, { encoding: 'utf8', timeout: 180000 });
    log(out);
  } catch(e) {
    log('❌ Failed: ' + e.message.substring(0, 200));
  }
}

// ═══ MAIN ═══
log('🕐 MMA Scheduler started — runs daily at 9:00 AM IST');
log(`   Next run in: ${Math.round(msUntil9AM()/60000)} minutes`);

let lastDate = '';

setInterval(() => {
  const ist = istNow();
  const today = ist.toISOString().split('T')[0];
  const h = ist.getHours();
  const m = ist.getMinutes();

  // Run at 9:00 AM IST
  if (h === 9 && m === 0 && lastDate !== today) {
    lastDate = today;
    run();
  }
}, 30000); // check every 30s

// Hourly heartbeat
setInterval(() => {
  log(`⏰ Next run in ~${Math.round(msUntil9AM()/60000)} minutes`);
}, 3600000);
