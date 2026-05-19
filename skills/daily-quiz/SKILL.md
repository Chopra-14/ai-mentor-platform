# Daily Quiz Skill

## Purpose

This skill generates a personalized daily tech brief for the user.  
It uses the user's stored onboarding preferences to create:
- interview questions
- technical learning tidbits
- trending insights
- recent industry updates

The final response must be optimized for Telegram Markdown formatting.

---

## Required Memory Inputs

Read the following stored user memory fields before generating the response:

```json
{
  "domains": ["string"],
  "level": "string",
  "goals": ["string"],
  "timezone": "string"
}
```

Use:
- domains
- level
- goals

to personalize the generated content.

---

## Web Search Requirements

Use the `web_search` tool before generating the final response.

The search should focus on:
- recent content
- latest updates
- trending technologies
- recent interview patterns
- latest frameworks and tools
- industry developments

The search queries must be relevant to the user's selected domains.

Example queries:
- Search recent AI/ML interview trends 2026
- Search latest DevOps tools and updates
- Search trending backend engineering interview questions
- Search latest cloud computing best practices
- Search recent cybersecurity threats and tools

Always prioritize fresh and recent content.

---

## Interview Question Generation Rules

Generate exactly 5 interview questions.

Requirements:
- Questions must match the user's experience level.
- Questions must align with the user's domains and goals.
- Questions should reflect current industry trends.
- Questions should be concise and practical.

Do not generate more than 5 questions.

---

## Technical Tidbits Rules

Generate 3 to 5 technical tidbits.

Recommended:
- Generate exactly 4 tidbits for consistency.

Requirements:
- Tidbits should contain useful technical insights.
- Include recent tools, frameworks, best practices, or trends.
- Keep tidbits concise and informative.

---

## Telegram Markdown Output Format

The final Telegram message MUST follow this exact structure:

```md
🦞 *Your Daily Tech Brief* — [Current Date]

🧠 *Interview Questions*

1. Question one
2. Question two
3. Question three
4. Question four
5. Question five

💡 *Today's Tidbits*

- Tidbit one
- Tidbit two
- Tidbit three
- Tidbit four
```

---

## Important Rules

- Always use Telegram Markdown formatting.
- Always generate exactly 5 interview questions.
- Always generate between 3 and 5 tidbits.
- Always use recent web search results.
- Personalize all content using stored memory.
- Ensure the output is clean and easy to read on Telegram.
- Keep the tone professional, motivational, and concise.
- Do not include unnecessary explanations outside the required format.