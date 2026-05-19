const { exec } = require("child_process");

console.log("⏰ MMA NEWS ENGINE Scheduler Started");

function runGenerator() {
  console.log("🚀 Running generator at:", new Date().toLocaleString());

  exec("node generate.js", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }

    if (stderr) {
      console.error("⚠️ STDERR:", stderr);
    }

    console.log(stdout);
  });
}

runGenerator();

setInterval(runGenerator, 6 * 60 * 60 * 1000);
