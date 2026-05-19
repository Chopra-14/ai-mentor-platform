# User Onboarding Skill

## Purpose
This skill is responsible for onboarding new users of the AI Learning Assistant.  
It collects the user's technical interests, experience level, learning goals, and timezone in order to personalize future daily tech briefs and interview preparation content.

---

## Onboarding Flow

When a new user interacts with the Telegram bot for the first time:

1. Greet the user warmly.
2. Explain that the assistant will personalize daily learning content.
3. Ask the following questions one by one.

---

## Question 1 — Technical Domains

Ask the user which technical domains they are interested in.

Suggested examples:
- AI/ML
- Web Development
- Backend Development
- DevOps
- Cloud Computing
- Data Engineering
- Cybersecurity
- Mobile App Development

Allow multiple selections.

Store the response as:
`domains`

---

## Question 2 — Experience Level

Ask the user for their current experience level.

Options:
- Beginner
- Intermediate
- Advanced

Store the response as:
`level`

---

## Question 3 — Learning Goals

Ask the user what they are currently preparing for.

Suggested examples:
- Interview Preparation
- Building Projects
- Internship Preparation
- DSA Practice
- System Design
- Resume Improvement
- Competitive Programming

Allow multiple selections.

Store the response as:
`goals`

---

## Question 4 — Timezone

Ask the user for their timezone.

Suggested example:
- Asia/Kolkata

Store the response as:
`timezone`

---

## Memory Persistence

After collecting all onboarding responses, save the user preferences into persistent memory using the following exact schema:

```json
{
  "domains": ["AI/ML", "Backend Development"],
  "level": "Intermediate",
  "goals": ["Interview Preparation", "Building Projects"],
  "timezone": "Asia/Kolkata"
}
## Completion Message

After successfully saving the memory, send a confirmation message to the user.

Example:

"🎉 Your profile has been successfully configured!
You will now receive personalized daily tech briefs, interview questions, and learning insights every evening."

---

## Important Rules

- Always collect all four onboarding fields.
- Ensure domains and goals support multiple values.
- Ensure the memory schema matches the required structure exactly.
- Use a friendly and professional conversational tone.
- Do not skip timezone collection.
- Persist memory before ending the onboarding flow.