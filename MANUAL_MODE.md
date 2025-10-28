# Manual Control Mode

You now have a **manual control dashboard** to review posts before they go live.

## How to Use

### 1. Start the Control Panel

```bash
./start.sh
```

Or manually:
```bash
python3 api_server.py
```

### 2. Open in Browser

Visit: **http://localhost:5000**

### 3. Generate Posts

Click buttons to generate posts:
- **⚡ Generate 1 Post** - Create a single post for review
- **🎯 Generate 5 Posts** - Create a batch for review
- **📋 View Pending** - Review saved posts

### 4. Review and Approve

For each generated post:
- **📝 Review** the content
- **✅ Approve** to save (currently shows alert)
- **🗑️ Delete** to reject

## Current Workflow

1. **Generate** → AI creates post using DeepSeek
2. **Review** → You check quality, hook, content
3. **Approve** → Post goes to database (when connected)
4. **Feed Updates** → Your `index.html` shows new posts

## Next Steps to Connect to Database

Once you have PostgreSQL set up:

1. **Import schema** `database/schema.sql`
2. **Import Wikipedia** using `scripts/import_wiki_to_db.py` 
3. **Update `api_server.py`** to save approved posts to database
4. **Update `index.html`** to fetch from `/api/posts` instead of demo data

## Features

✅ Manual post generation  
✅ Quality review before publishing  
✅ Batch generation (1 or 5 posts)  
✅ Approve/Reject workflow  
✅ Preview generated content  
✅ Beautiful control interface  

This prevents low-quality content from going live and gives you full control! 🎛️

