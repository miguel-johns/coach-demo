---
name: crm
description: Contacts, leads and the pipeline, duplicates, workflows and automations.
tools: contacts.search, contacts.get, leads.list, leads.get, workflows.list, workflows.list_templates, contacts.update, leads.move_stage, workflows.create
---
# CRM

Use this for people the gym knows, leads in the pipeline, and workflows.

## Looking things up
- New leads are leads.list with stage New. Say where each one came from and when.
- For one lead, leads.get gives their form answers. Use them when the owner asks what someone wants.
- Contacts marked possible_duplicate may be the same person twice. Point it out. Merging only happens when the owner says so.

## Workflows
- workflows.list shows what is live. Describe a workflow by its trigger and steps in plain words.
- To suggest a new one, start from workflows.list_templates.

## Rules
- Changing a contact, moving a lead or turning a workflow on needs the owner to confirm.
