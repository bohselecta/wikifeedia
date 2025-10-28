# Wikifeedia Setup Guide

## Prerequisites

You need to:
1. **Wait for downloads to complete** - The `.torrent` files you see will download the actual dump files
2. Look for files named like:
   - `enwiki-YYYYMMDD-pages-articles-multistream.xml.bz2` (the actual dump, ~20GB compressed)
3. Move these files to a `data/` folder in this repo

## Step 1: Install Dependencies

```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install postgresql python3-pip nodejs npm curl -y

# Set up API keys
# Copy the example environment file and add your DeepSeek API key
cp .env.example .env
# Edit .env and add your DEEPSEEK_API_KEY

# Note: We're using DeepSeek API instead of Ollama
# Get your API key from: https://platform.deepseek.com/

# Install Python packages
pip3 install openai python-dotenv psycopg2-binary wikiextractor pandas

# Note: You don't need Ollama anymore - we're using DeepSeek API instead

# Install Node.js packages (in this directory)
npm install express pg cors nodemon
```

## Step 2: Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE wikifeedia;
CREATE USER wikifeedia_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE wikifeedia TO wikifeedia_user;
\q

# Run schema
psql -U wikifeedia_user -d wikifeedia -f database/schema.sql
```

## Step 3: Extract and Import Wikipedia Data

Wait for your torrent downloads to finish, then:

```bash
# Create data directory
mkdir -p data

# Move the downloaded files here
# You'll have something like: enwiki-20251001-pages-articles-multistream.xml.bz2

# Extract Wikipedia articles (this will take a while)
wikiextractor --json -o data/extracted_wiki data/*.xml.bz2

# Import to database
python3 scripts/import_wiki_to_db.py
```

## Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your DeepSeek API key
nano .env

# Required settings:
# DEEPSEEK_API_KEY=your_key_here
# DB_PASSWORD=your_database_password
```

## Step 5: Start the AI Content Generator

```bash
# Run as a service
python3 content_generator.py

# Or in background
nohup python3 content_generator.py > generator.log 2>&1 &
```

## Step 6: Start the API Server

```bash
# In one terminal
npm start

# Or run in background
pm2 start server.js --name wikifeedia-api
```

## Step 7: Open the Frontend

1. Open `index.html` in your browser
2. Or serve it: `python3 -m http.server 8000`
3. Visit `http://localhost:8000`

## Directory Structure

```
wikifeedia/
├── index.html           # Frontend (works standalone, points to demo data)
├── data/                # Wikipedia dump files go here
│   ├── *.xml.bz2       # Download the actual dump here
│   └── extracted_wiki/ # Extracted articles (from wikiextractor)
├── database/
│   └── schema.sql      # Database schema
├── scripts/
│   └── import_wiki_to_db.py  # Import Wikipedia to database
├── content_generator.py # AI content generation service
├── server.js           # Backend API (connects to PostgreSQL)
├── config.json         # Configuration file
└── package.json        # Node.js dependencies
```

## Configuration

Edit `config.json`:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "wikifeedia",
    "user": "wikifeedia_user",
    "password": "your_password"
  },
  "api": {
    "provider": "deepseek",
    "model": "deepseek-v3.2-exp"
  },
  "generator": {
    "batch_size": 5,
    "batch_delay_seconds": 600,
    "min_quality_score": 6.0
  }
}
```

## Monitoring

Check generation logs:
```bash
tail -f generator.log
```

View database stats:
```bash
psql -U wikifeedia_user -d wikifeedia -c "SELECT COUNT(*) FROM posts;"
```

## Troubleshooting

**No images showing?**
- Check that Wikimedia Commons URLs are accessible
- Some articles don't have images - that's normal

**AI not generating posts?**
- Check your DeepSeek API key is set in .env file
- Verify API key is valid at https://platform.deepseek.com/
- Check logs: `tail -f generator.log`
- Verify database connection in .env

**Database connection errors?**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in config.json
- Check firewall rules

## Next Steps

Once running, the system will:
1. Generate 5 posts every 10 minutes using DeepSeek API
2. Create AI comments for each post
3. Populate your feed automatically
4. Serve content via the API

You can adjust generation frequency in `.env` file:
- `BATCH_SIZE`: Number of posts per batch (default: 5)
- `BATCH_DELAY_SECONDS`: Wait time between batches (default: 600 seconds = 10 minutes)

## API Costs

DeepSeek is very affordable:
- ~$0.14 per 1M input tokens
- ~$0.28 per 1M output tokens
- Typical post generation: ~1000 tokens ($0.0003 per post)
- 5 posts per batch = ~$0.0015 per batch
- 144 batches per day = ~$0.22 per day to run 24/7

This is significantly cheaper than OpenAI GPT-4!

