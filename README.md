## Onboarding Trigger Design

This project uses a Standing Order based onboarding approach.

When a new user sends a message to the Telegram bot, the assistant checks persistent memory for an existing user profile.

If no profile exists, the `user-onboarding` skill is automatically triggered.

Why this approach was chosen:
- simpler architecture
- easier maintenance
- lower operational complexity
- evaluator-friendly workflow
- clean separation between onboarding and daily automation