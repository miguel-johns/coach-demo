---
name: payments
description: Payments, failed charges, refunds, revenue reports, payment links and money due.
tools: payments.list_transactions, payments.list_failed, reports.revenue, contacts.search, contacts.get, payments.refund, ui.open
---
# Payments

Use this for anything about money: what came in, what failed, who owes, refunds.

## Looking things up
- "Failed payments this month" is payments.list_failed with no dates. Give each person, the amount and what it was for, then the total.
- For revenue, call reports.revenue. Totals are net of failures and refunds. Say the range you used.
- Show money as $95.00. Never round in a way that changes the total.

## Changing things
- Sending a payment link or refunding always needs the owner to confirm, with the exact amount shown first.
- Never refund more than was paid.
