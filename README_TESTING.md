# Playwright Testing for Wikifeedia

## Quick Start

### Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm run test:e2e

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test wikifeedia.spec.ts

# Run in debug mode
npx playwright test --debug

# Run on specific browser
npx playwright test --project=chromium
```

## What's Tested

### ✅ UI Components
- Header with logo displays correctly
- Navigation links are visible
- Search bar is functional
- Surprise Me button present
- Category filters work
- Tagline displays
- Mobile responsive design

### ✅ Posts
- Posts are displayed (or show empty state)
- Images load correctly
- TL;DR sections visible
- Can expand posts to see comments
- Upvote buttons work
- Share and Wikipedia links present

### ✅ Authentication
- Sign in button opens modal
- Email input is functional
- Can close sign in modal
- Magic link sending works

### ✅ Visual
- Dark theme is applied (#0a0a0a)
- Hover effects work
- Proper colors and styling

## Test Structure

```
tests/
  └── wikifeedia.spec.ts    # Main test suite
```

The test suite is organized into sections:

1. **Wikifeedia** - General UI and posts
2. **Authentication Flow** - Sign in process

## Test Commands

```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test -g "page loads"

# Update snapshots
npx playwright test --update-snapshots

# Generate report
npx playwright show-report
```

## Continuous Integration

Tests run automatically on:
- Chromium, Firefox, WebKit
- Mobile Chrome and Safari
- Different viewport sizes

## Debugging Tests

1. **Run with UI**:
   ```bash
   npx playwright test --ui
   ```

2. **Debug specific test**:
   ```bash
   npx playwright test -g "can sign in" --debug
   ```

3. **Run in headed mode**:
   ```bash
   npx playwright test --headed
   ```

4. **Slow down**:
   ```bash
   npx playwright test --timeout=60000
   ```

## Writing New Tests

Add new tests to `tests/wikifeedia.spec.ts`:

```typescript
test('my new feature', async ({ page }) => {
  await page.goto('/');
  // Your test code here
});
```

## Best Practices

1. **Use descriptive test names**
2. **Wait for elements before interacting**
3. **Use page objects for complex pages**
4. **Take screenshots for failures**
5. **Test mobile and desktop**

## Example Test

```typescript
test('posts have correct structure', async ({ page }) => {
  await page.goto('/');
  
  const postCard = page.locator('[class*="post-card"]').first();
  
  // Check title exists
  const title = postCard.locator('h2');
  await expect(title).toBeVisible();
  
  // Check content exists
  const content = postCard.locator('p');
  await expect(content).toBeVisible();
});
```

## Troubleshooting

### Tests Fail on First Run

Make sure the dev server is running:
```bash
npm run dev
```

### Tests Timeout

Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```

### Screenshots Not Generating

Check that `screenshot` is enabled in config:
```typescript
use: {
  screenshot: 'only-on-failure',
}
```

## Coverage

Current test coverage:
- ✅ Header and navigation
- ✅ Search functionality
- ✅ Authentication flow
- ✅ Post display and interaction
- ✅ Category filtering
- ✅ Responsive design
- ✅ Visual elements

## Next Steps

Add tests for:
- [ ] AI comment replies
- [ ] Upvote persistence
- [ ] Bookmark functionality
- [ ] Search results
- [ ] Category-specific content
- [ ] Share functionality

---

**Run tests with:** `npm run test:e2e`

