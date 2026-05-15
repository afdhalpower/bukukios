import { test, expect } from '@playwright/test';

test('Settings page loads without errors', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      messages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:8081');
  await page.waitForTimeout(3000);

  // Navigate to Settings tab
  const settingsTab = page.locator('text=Pengaturan').first();
  await settingsTab.click();
  await page.waitForTimeout(2000);

  const snapshot = await page.locator('body').evaluate((el: HTMLElement) => el.innerText);
  console.log('Settings page content preview:', snapshot.substring(0, 300));

  // Check for key settings elements
  const hasProfile = snapshot.includes('Admin Toko');
  const hasDarkMode = snapshot.includes('Mode Gelap');
  const hasReset = snapshot.includes('Reset Data');
  const hasVersion = snapshot.includes('1.0.0');

  console.log('Has profile section:', hasProfile);
  console.log('Has dark mode toggle:', hasDarkMode);
  console.log('Has reset data:', hasReset);
  console.log('Has version info:', hasVersion);

  const realErrors = messages.filter(m => 
    !m.includes('deprecated') && 
    !m.includes('shadow*') && 
    !m.includes('pointerEvents')
  );
  
  console.log('Runtime errors:', realErrors.length);
  if (realErrors.length > 0) {
    console.log('Error details:', realErrors);
  }

  expect(realErrors.length).toBe(0);
  expect(hasProfile || hasDarkMode).toBe(true);
});
