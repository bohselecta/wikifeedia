import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { title, userComment, postId, username } = await request.json()

    // Get DeepSeek API key
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly AI bot on Wikifeedia. Keep responses short (2-3 sentences max), conversational, and helpful. No emojis unless it adds to the conversation.'
          },
          {
            role: 'user',
            content: `Post: "${title}"\n\nUser @${username} commented: "${userComment}"\n\nWrite a natural reply to this comment that adds value to the discussion.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return NextResponse.json({ error: 'No reply generated' }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('AI reply error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

