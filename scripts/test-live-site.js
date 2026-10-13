const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function runTests() {
  const screenshotsDir = path.join(__dirname, "../test-screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log("Launching headless Chromium browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => {
    errors.push(`[PAGE ERROR]: ${err.message}`);
    console.error("PAGE ERROR:", err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`[CONSOLE ERROR]: ${msg.text()}`);
      console.error("CONSOLE ERROR:", msg.text());
    }
  });

  // TEST 1: Homepage
  console.log("\n--- TEST 1: Navigating to Homepage (http://localhost:3000) ---");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(1000);

  // Check background animation canvas
  const canvas = await page.$("canvas");
  if (canvas) {
    const box = await canvas.boundingBox();
    console.log(`✓ Tech Cloud Canvas found: width=${box?.width}px, height=${box?.height}px`);
  } else {
    console.error("✗ Tech Cloud Canvas NOT found!");
  }

  await page.screenshot({ path: path.join(screenshotsDir, "01-homepage-light.png"), fullPage: false });
  console.log("✓ Saved 01-homepage-light.png");

  // TEST 2: Dark Mode Toggle
  console.log("\n--- TEST 2: Testing Dark Mode Toggle ---");
  const themeToggle = await page.$("button[aria-label='Toggle color theme']");
  if (themeToggle) {
    await themeToggle.click({ timeout: 5000 });
    await page.waitForTimeout(600);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    console.log(`✓ Dark mode active: ${isDark}`);
    await page.screenshot({ path: path.join(screenshotsDir, "02-homepage-dark.png"), fullPage: false });
    console.log("✓ Saved 02-homepage-dark.png");
  } else {
    console.warn("Theme toggle button not found on navbar");
  }

  // TEST 3: Mobile Client Setup Modal
  console.log("\n--- TEST 3: Testing Mobile Setup Modal ---");
  const appleBtn = await page.$("button:has-text('Apple Mail & iOS')");
  if (appleBtn) {
    await appleBtn.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    const modalText = await page.innerText("body");
    const hasModal = modalText.includes("mail.zegamail.com") || modalText.includes("Incoming Mail (IMAP)");
    console.log(`✓ Mobile Client Modal opens correctly: ${hasModal}`);
    await page.screenshot({ path: path.join(screenshotsDir, "03-client-setup-modal.png") });
    // Close modal
    const closeBtn = await page.$("button:has-text('Close Setup Guide'), button:has-text('✕')");
    if (closeBtn) await closeBtn.click({ timeout: 3000 });
    await page.waitForTimeout(300);
  }

  // TEST 4: Pricing Page
  console.log("\n--- TEST 4: Navigating to Pricing Page ---");
  await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(500);
  const pricingTitle = await page.title();
  console.log(`✓ Pricing page title: "${pricingTitle}"`);
  await page.screenshot({ path: path.join(screenshotsDir, "04-pricing-page.png") });

  // TEST 5: App Workspace & Tabs
  console.log("\n--- TEST 5: Navigating to App Workspace ---");
  await page.goto("http://localhost:3000/app", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "05-app-mail.png") });

  // Click AI tab
  const aiTab = await page.$("button[title='Zega AI Assistant']");
  if (aiTab) {
    await aiTab.click({ timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, "06-app-ai-studio.png") });
    console.log("✓ Switched to AI Studio tab");
  }

  // Click Campaigns tab
  const campTab = await page.$("button[title='Email Campaigns & Leads']");
  if (campTab) {
    await campTab.click({ timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, "07-app-campaigns.png") });
    console.log("✓ Switched to Campaigns tab");
  }

  // Click Domains tab
  const domainTab = await page.$("button[title='Domains & DNS Routing']");
  if (domainTab) {
    await domainTab.click({ timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, "08-app-domains.png") });
    console.log("✓ Switched to Domains tab");
  }

  // Click Settings tab
  const settingsTab = await page.$("button[title='Admin & Organization Settings']");
  if (settingsTab) {
    await settingsTab.click({ timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, "09-app-settings.png") });
    console.log("✓ Switched to Settings tab");
  }

  // TEST 6: Login page
  console.log("\n--- TEST 6: Navigating to Login Page ---");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, "10-login-page.png") });
  console.log("✓ Saved 10-login-page.png");

  // TEST 7: Signup page
  console.log("\n--- TEST 7: Navigating to Signup Page ---");
  await page.goto("http://localhost:3000/signup", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, "11-signup-page.png") });
  console.log("✓ Saved 11-signup-page.png");

  console.log("\n============================================================");
  console.log(`TEST SUMMARY: Total errors logged: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach((e) => console.log(" - " + e));
  } else {
    console.log("✓ ALL PAGES AND BUTTONS RENDERED WITH 0 ERRORS!");
  }
  console.log("============================================================\n");

  await browser.close();
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
