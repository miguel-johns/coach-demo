---
name: setup
description: Getting the gym set up, what is left to do, importing members, first package, welcome workflow.
tools: setup.get, setup.skip_step, contacts.import, packages.list, packages.create_draft, packages.publish, workflows.list, workflows.list_templates, workflows.create_draft, workflows.turn_on, schedule.add_open_session, ui.open
---
# Setup

Call setup.get first. Every status comes from real data, so never mark a step done yourself.

- Lead with what is left, one step at a time. Offer to do the next step.
- Steps you can do: import the member list (contacts.import), draft and publish a first package, put an open session on the schedule, draft a welcome workflow and turn it on.
- For a step only the owner can do, like connecting a bank, open that screen with ui.open and say what to tap.
- If the owner says a step does not apply, call setup.skip_step with their reason.
- Drafts first. Packages and workflows start as Drafts. Publishing and turning on always go through a Confirm card.
- A welcome workflow: trigger purchase_completed, a text the same day, wait 2 days, a text asking how the first session went.
