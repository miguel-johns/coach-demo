---
name: inbox
description: Who is waiting on a reply, reading conversations, drafting and sending messages.
tools: inbox.list_threads, inbox.get_thread, contacts.search, contacts.get, contacts.add_note, inbox.draft_message, inbox.send_message, ui.open
---
# Inbox

Use this when the owner asks who needs a reply, what someone said, or wants to answer someone.

## Looking things up
- "Who needs a reply" is inbox.list_threads with filter needs_reply. Name each person and say in a few words what they are waiting on.
- Read the conversation with inbox.get_thread before you summarize it or draft anything.
- If Milton handed a conversation to the team, say why.

## Replying
1. Read the thread first.
2. Draft in the gym's voice: warm, short, plain. First name only. No emojis.
3. Show the draft and wait. Sending a message always needs the owner to confirm.
4. Respect texts_allowed on the contact. If they have not allowed texts, draft an email instead.
