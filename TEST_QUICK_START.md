# Playwright Testing - Quick Start

## ✅ Installed!

Playwright is now installed. Here's how to use it:

## Run Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI (recommended for first time)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test
npx playwright test wikifeedia.spec.ts -g "page loads"
```

### Debug Mode

```bash
# Debug with inspector
npx playwright test --debug

# Run specific test with debug
npx playwright test -g "sign in" --debug
```

## What's Being Tested

### ✅ UI Components
- Header with logo
- Navigation links  
- Search bar
- Category filters
- Sign in button
- Surprise Me button

### ✅ Posts
- Post cards display
- Images load
- TL;DR sections
- Expand to see comments
- Upvote buttons
- Share links

### ✅ Authentication
- Sign in modal opens
- Email input works
- Can close modal

### ✅ Responsive
- Mobile menu button
- Desktop vs mobile layouts
- Different viewport sizes

## Test Files

```
tests/
  └── wikifeedia.spec.ts   # All tests

playwright.config.ts        # Config
```

## First Run

```bash
# Start the app
npm run dev

# In another terminal, run tests
npm run test:e2e:ui
```

This opens Playwright UI where you can:
- See all tests
- Run individual tests
- Debug step by step
- See screenshots

## Common Commands

```bash
# Update snapshots (if design changes)
npx playwright test --update-snapshots

# Run only on Chrome
npx playwright test --project=chromium

# Run only mobile tests
npx playwright test --project="Mobile Chrome"

# Generate HTML report
npx playwright show-report
```

## What Gets Tested

### Test Coverage

✅ **Header & Navigation**
- Logo displays
- Navigation links visible
- Category buttons work

✅ **Authentication**
- Sign in modal opens
- Email input functional
- Can send magic link

✅ **Post Interactions**
- Posts display correctly
- Can expand for comments
- Upvote buttons work
- Share and Wikipedia links

✅ **Responsive Design**
- Mobile menu appears
- Desktop layout works
- Search hidden on mobile

✅ **Visual Elements**
- Dark theme applied
- Colors correct
- Hover effects work

## Example: Running a Single Test

```bash
# Run only the "page loads" test
npx playwright test -g "page loads"

# With UI
npx playwright test -g "page loads" --ui

# With debug
npx playwright test -g "page loads" --debug
```

## CI/CD Integration

Tests run automatically on GitHub:

```yaml
# .github/workflows/playwright.yml
- Runs on push/PR
- Tests all browsers
- Uploads reports
```

## Screenshots & Videos

Playwright automatically:
- Takes screenshots on failure
- Records videos (in CI)
- Shows network requests
- Displays console logs

## Next Steps

1. **Run tests**: `npm run test:e2e:ui`
2. **Explore the UI**: Click through tests
3. **Debug**: Click "Debug" on any test
4. **Write more tests**: Add to `wikifeedia.spec.ts`

---

**Ready to test! Run:** `npm run test:e2e:ui`

