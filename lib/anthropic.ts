import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return message.content[0]?.type === 'text' ? message.content[0].text : ''
}
