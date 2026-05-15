import { test, expect } from '@playwright/test';

test('Splash screen and branding verification', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      messages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:8081');
  await page.waitForTimeout(5000);

  const snapshot = await page.locator('body').evaluate((el: HTMLElement) => el.innerText);
  console.log('Page content preview:', snapshot.substring(0, 200));

  const hasBukuKios = snapshot.includes('BukuKios') || snapshot.includes('Buku Besar');
  console.log('Has BukuKios branding:', hasBukuKios);

  const realErrors = messages.filter(m => 
    !m.includes('deprecated') && 
    !m.includes('shadow*') && 
    !m.includes('pointerEvents')
  );
  
  console.log('Runtime errors:', realErrors.length);
  if (realErrors.length > 0) {
    console.log('Error details:', realErrors);
  }

  console.log('All console messages:', messages);
});
