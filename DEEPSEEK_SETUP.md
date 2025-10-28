# DeepSeek API Setup for Wikifeedia

## What's Changed

✅ **Content generator now uses DeepSeek API** instead of Ollama  
✅ **Created `.env.example`** for environment variables  
✅ **No more need for local Ollama** - everything uses DeepSeek's cloud API  
✅ **Cost-effective**: Only ~$0.22/day to run 24/7!

## Quick Setup

### 1. Get Your DeepSeek API Key

Visit: https://platform.deepseek.com/
- Sign up for an account
- Go to API Keys
- Create a new key
- Copy the key (starts with `sk-...`)

### 2. Create Your Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit it with your API key
nano .env
# or
open -e .env
```

Add your API key:
```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
DB_PASSWORD=your_database_password
```

### 3. Install Python Dependencies

```bash
pip3 install openai python-dotenv psycopg2-binary
```

### 4. That's It!

Now you can run the content generator:

```bash
python3 content_generator.py
```

## API Details

- **Model**: `deepseek-v3.2-exp`
- **Endpoint**: `https://api.deepseek.com/v1`
- **Format**: OpenAI-compatible API

The content generator automatically:
- Uses your API key from `.env`
- Makes chat completion requests
- Handles rate limits gracefully
- Generates engaging posts

## Cost Breakdown

DeepSeek pricing (as of 2024):
- **Input**: $0.14 per 1M tokens
- **Output**: $0.28 per 1M tokens

### Typical Usage Per Post:
- Input tokens: ~800
- Output tokens: ~1000
- **Cost per post**: ~$0.0004

### Daily Cost (5 posts every 10 minutes = 144 batches/day):
- Posts per day: 720
- **Daily cost**: ~$0.29
- **Monthly cost**: ~$8.70

Very affordable! 🎉

## Configuration

Edit `.env` to adjust settings:

```env
# Number of posts generated per batch
BATCH_SIZE=5

# Time between batches (in seconds)
BATCH_DELAY_SECONDS=600  # 10 minutes

# Minimum quality score (posts below this are rejected)
MIN_QUALITY_SCORE=6.0
```

## Troubleshooting

**"DEEPSEEK_API_KEY not found"**
→ Make sure you've created `.env` from `.env.example` and added your key

**"API rate limit exceeded"**
→ DeepSeek has generous limits, but if you hit it:
→ Reduce `BATCH_SIZE` in `.env`
→ Increase `BATCH_DELAY_SECONDS`

**High costs?**
→ Reduce generation frequency
→ Lower `MIN_QUALITY_SCORE` (fewer regenerations needed)
→ Monitor usage at https://platform.deepseek.com/

## How It Works

1. Generator selects interesting Wikipedia article
2. Sends article to DeepSeek API with creative prompt
3. DeepSeek generates engaging post + quality score
4. If quality score is high enough, saves to database
5. Generates AI comments with different personas
6. Repeats every 10 minutes

The AI creates posts like:
- "The CIA spent $20 million training cats to be spies..."
- "Marie Curie's notebooks are still radioactive..."
- "Octopuses have three hearts and blue blood..."

All automatically mined from your Wikipedia dump! 🤖

