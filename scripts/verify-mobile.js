const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const screenshotsDir = path.join(__dirname, '..', 'artifacts-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000/app in mobile viewport (375x812)...');

  try {
    await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('Fallback navigation: waiting for domcontentloaded...');
    await page.goto('http://localhost:3000/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  // Remove dev overlays from screenshots
  await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-dev-overlay] { display: none !important; }' });
  await page.waitForTimeout(400);

  // 1. Initial Webmail View (Message List on Mobile)
  await page.screenshot({ path: path.join(screenshotsDir, 'mobile-1-mail-list.png'), fullPage: false });
  console.log('Saved mobile-1-mail-list.png');

  // Check horizontal overflow
  const isOverflowing1 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('Horizontal overflow on Mail List:', isOverflowing1 ? 'YES (OVERFLOW!)' : 'NO (PERFECT)');

  // 2. Open Folders View
  const foldersBtn = page.locator('button:has-text("Folders")').first();
  if (await foldersBtn.isVisible()) {
    await foldersBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-2-folders-view.png') });
    console.log('Saved mobile-2-folders-view.png');

    // Click back to Inbox folder
    const inboxFolderBtn = page.locator('button:has-text("Inbox")').first();
    if (await inboxFolderBtn.isVisible()) {
      await inboxFolderBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 3. Open Message View (Click first message card)
  const firstMessage = page.locator('[data-testid="message-item"], [data-message-item="true"]').first();
  const fallbackMessage = page.locator('div:has-text("Acme")').first();
  const targetMsg = (await firstMessage.count()) > 0 ? firstMessage : fallbackMessage;

  // Let's click any message row
  const msgButtons = page.locator('button:has-text("Re:"), div:has-text("Re:")').first();
  if (await msgButtons.isVisible()) {
    await msgButtons.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-3-message-detail.png') });
    console.log('Saved mobile-3-message-detail.png');

    // Click Back to Inbox
    const backBtn = page.locator('button:has-text("Back to")').first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 4. Open Settings Workspace via Mobile Bottom Nav
  console.log('Testing Mobile Bottom Bar -> Settings tab...');
  const settingsTab = page.locator('nav[aria-label="Mobile Navigation"] button:has-text("Settings")');
  if (await settingsTab.isVisible()) {
    await settingsTab.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-4-settings-admin.png') });
    console.log('Saved mobile-4-settings-admin.png (Admin Owner View)');

    // Toggle to Member view
    const memberToggle = page.locator('button:has-text("Mailbox User"), button:has-text("Member View")').first();
    if (await memberToggle.isVisible()) {
      await memberToggle.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, 'mobile-5-settings-member.png') });
      console.log('Saved mobile-5-settings-member.png (Member View)');
    }
  }

  // 5. Open Campaigns Workspace via Mobile Bottom Nav
  console.log('Testing Mobile Bottom Bar -> Campaigns tab...');
  const campaignsTab = page.locator('nav[aria-label="Mobile Navigation"] button:has-text("Campaigns")');
  if (await campaignsTab.isVisible()) {
    await campaignsTab.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-6-campaigns.png') });
    console.log('Saved mobile-6-campaigns.png');
  }

  // 6. Open Domains Workspace via Mobile Bottom Nav
  console.log('Testing Mobile Bottom Bar -> Domains tab...');
  const domainsTab = page.locator('nav[aria-label="Mobile Navigation"] button:has-text("Domains")');
  if (await domainsTab.isVisible()) {
    await domainsTab.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-7-domains.png') });
    console.log('Saved mobile-7-domains.png');
  }

  // 7. Open Contacts Workspace via Mobile Bottom Nav
  console.log('Testing Mobile Bottom Bar -> Contacts tab...');
  const contactsTab = page.locator('nav[aria-label="Mobile Navigation"] button:has-text("Contacts")');
  if (await contactsTab.isVisible()) {
    await contactsTab.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-8-contacts.png') });
    console.log('Saved mobile-8-contacts.png');
  }

  // 8. Dark Mode Verification on Mobile
  console.log('Testing Dark Mode on Mobile...');
  const themeToggle = page.locator('header button[aria-label*="dark"], header button:has(svg.lucide-moon)').first();
  if (await themeToggle.isVisible()) {
    await themeToggle.click({ force: true });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-9-dark-contacts.png') });
    console.log('Saved mobile-9-dark-contacts.png');

    // Switch back to Mail tab in Dark Mode
    const mailTab = page.locator('nav[aria-label="Mobile Navigation"] button:has-text("Mail")');
    if (await mailTab.isVisible()) {
      await mailTab.click({ force: true });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, 'mobile-10-dark-mail.png') });
      console.log('Saved mobile-10-dark-mail.png');
    }
  }

  console.log('Mobile tests completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
