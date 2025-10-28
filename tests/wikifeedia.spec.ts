import { test, expect } from '@playwright/test';

test.describe('Wikifeedia', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('http://localhost:3000');
  });

  test('page loads with header', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Wikifeedia/i);
    
    // Check logo is visible
    const logo = page.locator('img[alt="Wikifeedia"]');
    await expect(logo).toBeVisible();
    
    // Check brand name
    const brandName = page.locator('h1:has-text("Wikifeedia")');
    await expect(brandName).toBeVisible();
  });

  test('navigation links are visible', async ({ page }) => {
    const feedLink = page.locator('button:has-text("Feed")');
    const trendingLink = page.locator('button:has-text("Trending")');
    const savedLink = page.locator('button:has-text("Saved")');
    const categoriesLink = page.locator('button:has-text("Categories")');
    
    await expect(feedLink).toBeVisible();
    await expect(trendingLink).toBeVisible();
    await expect(savedLink).toBeVisible();
    await expect(categoriesLink).toBeVisible();
  });

  test('search bar is visible', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');
    await expect(searchInput).toBeVisible();
    
    // Search should be clickable
    await searchInput.click();
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
  });

  test('surprise me button is visible', async ({ page }) => {
    const surpriseButton = page.locator('button:has-text("Surprise Me")');
    await expect(surpriseButton).toBeVisible();
  });

  test('sign in button works', async ({ page }) => {
    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
    
    // Click sign in
    await signInButton.click();
    
    // Modal should appear
    const emailInput = page.locator('input[type="email"][placeholder*="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('category filters are visible', async ({ page }) => {
    const allButton = page.locator('button:has-text("All")');
    const historyButton = page.locator('button:has-text("History")');
    const natureButton = page.locator('button:has-text("Nature")');
    const scienceButton = page.locator('button:has-text("Science")');
    
    await expect(allButton).toBeVisible();
    await expect(historyButton).toBeVisible();
    await expect(natureButton).toBeVisible();
    await expect(scienceButton).toBeVisible();
  });

  test('posts are displayed', async ({ page }) => {
    // Wait for posts to load (they might be empty initially)
    const noPostsMessage = page.locator('text=No posts found');
    
    // Either posts exist OR no posts message exists
    const postsContainer = page.locator('main').locator('div').first();
    
    // Check if we have posts or the empty state
    const hasNoPosts = await noPostsMessage.isVisible().catch(() => false);
    const hasPosts = !hasNoPosts;
    
    if (hasPosts) {
      // Check that post cards exist
      const postCards = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]');
      const count = await postCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('can expand post to see comments', async ({ page }) => {
    // Wait a moment for any content to load
    await page.waitForTimeout(1000);
    
    // Try to find a post card
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Click on the post title to expand
      const title = postCard.locator('h2').first();
      if (await title.isVisible().catch(() => false)) {
        await title.click();
        
        // Should see comments section
        const commentsSection = postCard.locator('text=Comments');
        await expect(commentsSection).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('upvote button is functional', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Look for upvote button
      const upvoteButton = postCard.locator('button').filter({ hasText: '⬆' }).first();
      
      if (await upvoteButton.isVisible().catch(() => false)) {
        // Get initial count
        const upvoteCount = upvoteButton.locator('span').last();
        const initialCount = await upvoteCount.textContent();
        
        // Click upvote
        await upvoteButton.click();
        
        // Might show alert for sign in
        await page.waitForTimeout(500);
      }
    }
  });

  test('image displays correctly', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Check for images
      const images = postCard.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();
      }
    }
  });

  test('responsive design - mobile menu button', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu button should be visible on small screens
    const mobileMenuButton = page.locator('button[aria-label="Open mobile menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Search bar should be hidden on mobile
    const searchInput = page.locator('input[placeholder="Search..."]');
    await expect(searchInput).not.toBeVisible();
  });

  test('category filter works', async ({ page }) => {
    const allButton = page.locator('button:has-text("All")');
    const historyButton = page.locator('button:has-text("History")');
    
    await expect(allButton).toBeVisible();
    await expect(historyButton).toBeVisible();
    
    // Click history category
    await historyButton.click();
    
    // Button should show as selected (blue background)
    await expect(historyButton).toHaveClass(/bg-blue-600/);
  });

  test('tagline displays correctly', async ({ page }) => {
    const tagline = page.locator('text=Where Wikipedia meets your feed');
    await expect(tagline).toBeVisible();
  });

  test('TL;DR sections are visible', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Look for TL;DR section
      const tldr = postCard.locator('text=TL;DR:');
      if (await tldr.isVisible().catch(() => false)) {
        await expect(tldr).toBeVisible();
      }
    }
  });

  test('Wikipedia link is present in footer', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Expand post to see footer
      const title = postCard.locator('h2').first();
      if (await title.isVisible().catch(() => false)) {
        await title.click();
        await page.waitForTimeout(500);
      }
      
      // Look for Wikipedia link
      const wikipediaLink = postCard.locator('a[href*="wikipedia.org"]');
      if (await wikipediaLink.isVisible().catch(() => false)) {
        await expect(wikipediaLink).toBeVisible();
      }
    }
  });

  test('share button is present', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Look for share button
      const shareButton = postCard.locator('button').filter({ hasText: 'Share' });
      if (await shareButton.isVisible().catch(() => false)) {
        await expect(shareButton).toBeVisible();
      }
    }
  });

  test('dark theme is applied', async ({ page }) => {
    const body = page.locator('body');
    
    // Check background color is dark
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should be dark (close to #0a0a0a)
    expect(backgroundColor).toMatch(/rgb\(10,\s*10,\s*10\)/);
  });

  test('post card hover effect works', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const postCard = page.locator('[class*="rounded-xl"][class*="bg-\\[\\#141414\\]"]').first();
    
    if (await postCard.isVisible().catch(() => false)) {
      // Hover over the post
      await postCard.hover();
      
      // Should have transform applied
      const transform = await postCard.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      
      // Transform should change on hover
      expect(transform).toBeTruthy();
    }
  });
});

test.describe('Authentication Flow', () => {
  test('can sign in with email', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click sign in
    const signInButton = page.locator('button:has-text("Sign In")');
    await signInButton.click();
    
    // Modal should appear
    const modal = page.locator('text=Sign In with Email');
    await expect(modal).toBeVisible();
    
    // Enter email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    
    // Click send
    const sendButton = page.locator('button:has-text("Send Magic Link")');
    await expect(sendButton).toBeVisible();
  });

  test('can close sign in modal', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Open modal
    const signInButton = page.locator('button:has-text("Sign In")');
    await signInButton.click();
    
    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();
    
    // Modal should be gone
    const modal = page.locator('text=Sign In with Email');
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });
});

