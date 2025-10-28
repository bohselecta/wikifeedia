# Wikifeedia Quick Start

## What You Have Now

✅ **Working demo** (`index.html`) - Open in browser to see the concept  
✅ **10 sample posts** with images and AI comments  
✅ **All backend files** ready to connect to real Wikipedia data

## What You Need to Do

### 1. Wait for Downloads to Finish

Your torrent files will download:
- `enwiki-YYYYMMDD-pages-articles-multistream.xml.bz2` (~20GB compressed)

Once downloaded, move it to a `data/` folder:
```bash
mkdir -p data
mv enwiki-*.xml.bz2 data/
```

### 2. Test the Demo First (No Setup Required!)

Just open `index.html` in your browser. It works completely standalone with:
- Search bar
- Category filtering
- Bookmarking
- Infinite scroll
- Surprise Me button
- Keyboard shortcuts (J/K/R/?)

### 3. Set Up the Full System (When Ready)

See `setup-guide.md` for complete instructions. You'll need:
1. PostgreSQL database
2. Ollama + Gemma model
3. Import Wikipedia dump
4. Start content generator
5. Start API server

## Image Handling (How It Works)

The system extracts image references from the Wikipedia dump and displays them from Wikimedia Commons URLs. Here's the flow:

```
Wikipedia Dump
    ↓
[extract articles]
    ↓
[parse for image references]
    ↓
[store in database as URLs]
    ↓
Content Generator creates posts
    ↓
Posts include image URLs
    ↓
Frontend displays from Wikimedia Commons
```

**Example:**
Article about "Octopus" has this in the XML:
```xml
[[File:Octopus_in_natural_habitat.jpg|800px|An octopus]]
```

Becomes:
```javascript
images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Octopus_in_natural_habitat.jpg/800px-Octopus_in_natural_habitat.jpg"]
```

These URLs are stored with each post in the database, then displayed in the feed (just like the demo does now).

## Current Status

- ✅ Frontend: Complete and working
- ✅ Backend API: Ready to serve PostgreSQL data
- ✅ Content Generator: Ready to create posts with Ollama
- ⏳ Database: Needs to be set up
- ⏳ Wikipedia Import: Waiting for your dump to finish downloading
- ⏳ AI Generation: Waiting for Ollama setup

## Next Steps

1. **Now**: Just open `index.html` and explore the demo!
2. **Later**: Follow `setup-guide.md` when you're ready to hook up the full system
3. **After Setup**: The system will auto-generate posts 24/7!

The demo shows exactly how the full system will look and feel. 🎉

