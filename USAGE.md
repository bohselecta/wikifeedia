# Wikifeedia - Content Generation

## ✅ Use Real Wikipedia Posts (Recommended)

Generate **unique posts from your 24GB Wikipedia dump**:

```bash
python3 scripts/generate_from_real_wiki.py
```

**What it does:**
- ✅ Reads from `enwiki-*.xml.bz2` (your actual Wikipedia data)
- ✅ Extracts 200 real Wikipedia articles
- ✅ Randomly selects 10 unique articles
- ✅ Generates engaging posts with AI
- ✅ **No duplicates!**

**Result:** 10 unique posts from real Wikipedia articles

---

## ❌ Old Script (Creates Duplicates)

The old script uses hardcoded samples and creates duplicates:

```bash
python3 scripts/generate_initial_content.py
```

**Use:** `scripts/generate_from_real_wiki.py` instead!

---

## Database Management

### Check Post Count

Run this in your Supabase SQL editor:

```sql
SELECT COUNT(*) as total_posts FROM posts;
```

### Clear All Posts

```sql
DELETE FROM comments;
DELETE FROM posts;
```

### View Recent Posts

```sql
SELECT title, category, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Summary

- **Use:** `generate_from_real_wiki.py` (reads Wikipedia dump)
- **Avoid:** `generate_initial_content.py` (hardcoded samples)
- **Location:** Wikipedia dump: `enwiki-20251001-pages-articles-multistream.xml.bz2` (24GB)

EOF
cat USAGE.md

