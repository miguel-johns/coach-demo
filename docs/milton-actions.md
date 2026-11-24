# Screen actions and Milton tools

Every action a person can take from a button, menu or panel, and the Milton tool that does it.
"missing" means Milton cannot do it yet; it should call `milton.cant_do` and open the screen.
Navigation, filters, tabs, copy and close buttons are not listed.

## Schedule: session card and Session Panel
| Action | Tool |
|---|---|
| Book a session / Book next | schedule.book_session |
| Reschedule (Move session) | schedule.reschedule |
| Cancel (more than 24h away) | schedule.cancel_session |
| Late cancel | schedule.late_cancel |
| Mark no show | schedule.mark_no_show |
| Check in | schedule.check_in |
| Check out | schedule.check_out |
| Edit session: day, time, status, reason | schedule.update_session |
| Remove session | schedule.remove_session |
| Add an open session / time | schedule.add_open_session |
| Pay amount due and check out / Take payment | missing (Point of sale) |
| Renew plan | missing |
| Check in all / Check out all (group roster) | missing (one at a time works) |
| Add a person to a group, Add over the limit | schedule.book_session |
| Approve / Decline booking request | missing |
| Add / remove hours override | missing |
| Share booking page | missing |

## Contacts and CRM
| Action | Tool |
|---|---|
| Add contact | contacts.create |
| Edit / Save status / Move to stage | contacts.update |
| Note / Add a note for the next coach | contacts.add_note |
| Import contacts | contacts.import |
| Merge duplicates / Not the same person | missing |
| Add tag (bulk) | missing |
| Message (bulk) | missing |
| Call / Call them one by one | missing |
| Add / remove pipeline stage | missing |

## Clients (client page)
| Action | Tool |
|---|---|
| Book session | schedule.book_session |
| Check out | schedule.check_out |
| Draft an update | inbox.draft_message |
| Send update | inbox.send_message |
| Send the health form | missing |
| Invite to app | missing |
| Set targets / goals, Add result | missing |
| Save photos / video to progress | missing |
| Pin note | missing |
| Assign coach | missing |

## Inbox
| Action | Tool |
|---|---|
| Draft reply | inbox.draft_message |
| Send now | inbox.send_message |
| Team note | contacts.add_note |
| Save as a Lead | contacts.create |
| Call / Call back / Answer / To voicemail | missing |
| Hand back to Milton | missing |

## Payments
| Action | Tool |
|---|---|
| Refund | payments.refund |
| Take payment (failed payment) | missing |
| Pause / Cancel / Resume membership | missing |
| Set / edit / remove monthly goal | missing |
| New / edit / end promo code | missing |
| Edit failed-payment message | missing |
| Download / print | missing |

## Point of sale
| Action | Tool |
|---|---|
| Take a sale / Save card | missing |

## Services and Packages
| Action | Tool |
|---|---|
| New package (draft) | packages.create_draft |
| Make package live | packages.publish |
| Edit / archive / restore package | missing |
| New / edit / archive service | missing |
| Create / delete booking link | missing |

## Workflows and Funnels
| Action | Tool |
|---|---|
| Use template / new workflow (draft) | workflows.create_draft |
| Make it live | workflows.turn_on |
| Pause / Archive / Duplicate / Delete workflow | missing |
| Create / duplicate / delete funnel, edit form | missing |
| Send a test lead | missing |

## Documents
| Action | Tool |
|---|---|
| New document / Publish | missing |
| Send / Resend to people | missing |
| Add a signed copy | missing |

## Setup
| Action | Tool |
|---|---|
| Skip step | setup.skip_step |

## Milton Settings
| Action | Tool |
|---|---|
| Edit / remove skill, Delete everything Milton learned | missing (by design: owner only) |
