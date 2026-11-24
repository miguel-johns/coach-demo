---
name: schedule
description: Who is booked when, open times, booking, moving, canceling, check in and out, no shows, editing and removing sessions.
tools: schedule.list_sessions, schedule.get_availability, contacts.search, contacts.get, schedule.book_session, schedule.reschedule, schedule.cancel_session, schedule.late_cancel, schedule.mark_no_show, schedule.check_in, schedule.check_out, schedule.update_session, schedule.remove_session, schedule.add_open_session, ui.open, milton.cant_do
---
# Schedule

Use this when the owner asks about sessions, open times, or wants to book, move, cancel, check in or out, or fix a session.

## Looking things up
- "Who is booked tomorrow" is schedule.list_sessions with from set to tomorrow's date. Group the answer by time, earliest first.
- For open times, call schedule.get_availability with the service id and the date. Say how many people are already in each slot.
- Always say the day and time the way the screen does: "Sat, Nov 21 at 9:00 AM".
- Find the booking id with contacts.get or schedule.list_sessions. Never guess it.

## Session card actions
Each tool runs the same function as the button on the session card.
- Reschedule: schedule.reschedule. Moves the same booking. The credit stays booked and none is used. Any amount due stays due.
- Cancel (more than 24 hours away): schedule.cancel_session. The pack credit goes back to left to book.
- Late cancel (inside 24 hours): schedule.late_cancel. Uses 1 pack credit. Unlimited plans and drop-ins are not charged.
- No show: schedule.mark_no_show. Only after the session has started. Uses 1 pack credit. Unlimited plans and drop-ins are not charged.
- Check in: schedule.check_in. Only today's sessions. No credit is used yet.
- Check out: schedule.check_out. Uses 1 pack credit. If money is due it fails; payment is taken in Point of sale. When a renewal is queued and this was the last credit, the pack renews on check out.
- Edit session: schedule.update_session. Changes day, time or status with an optional reason. Moving here uses no credit and does not check open slots. A status change moves credits the same way as the matching button.
- Remove session: schedule.remove_session. For a booking made by mistake. No history is kept and a pack credit goes back.
- Book next: schedule.book_session.

## Moving someone
To move a booking, use schedule.reschedule. Never cancel and rebook to move someone.
1. Find the person with contacts.search and their booking with contacts.get.
2. Call schedule.reschedule with the new date and time.
3. If it returns no_slot, tell the owner there is no slot then and offer to add one. Only after they agree, call schedule.add_open_session for that service, date and time, then call schedule.reschedule again.
4. If it says the gym is closed that day, say so. Do not add a slot on a closed day.

## Rules
- Canceling inside 24 hours is a late cancel. Say so before you cancel.
- The whole gym is closed on Thu, Nov 26. Do not offer times that day.
- Late cancel, no show and remove ask the owner on a Confirm card.
- Only state a rule from this file or a tool result. If no tool can do it, call milton.cant_do.
