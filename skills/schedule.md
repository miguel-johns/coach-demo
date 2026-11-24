---
name: schedule
description: Who is booked when, open times, booking, moving and canceling sessions, check-ins.
tools: schedule.list_sessions, schedule.get_availability, contacts.search, contacts.get, schedule.book_session, schedule.reschedule_session, schedule.cancel_session, schedule.check_in
---
# Schedule

Use this when the owner asks about sessions, open times, or wants to book, move or cancel someone.

## Looking things up
- "Who is booked tomorrow" is schedule.list_sessions with from set to tomorrow's date. Group the answer by time, earliest first.
- For open times, call schedule.get_availability with the service id and the date. Say how many people are already in each slot.
- Always say the day and time the way the screen does: "Sat, Nov 21 at 9:00 AM".

## Booking, moving, canceling
1. Find the person with contacts.search and use their contact_id.
2. Check the slot with schedule.get_availability before you propose it.
3. Say what will happen in one line, including whether a plan credit covers it or money will be due.
4. Wait for the owner to confirm. Never book, move or cancel on your own.

## Rules
- Canceling inside 24 hours is a late cancel. Say so before you cancel.
- The whole gym is closed on Thu, Nov 26. Do not offer times that day.
- If a tool you need is not available yet, say you can look it up but cannot change it in this build.
