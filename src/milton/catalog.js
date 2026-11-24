import { z } from 'zod'

/*
 * The tool registry. Shared by the chat route (which shows the model each
 * name, description and input schema) and the browser (which runs the tool
 * against the gym store). Names follow the platform spec: domain.verb_noun.
 */

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .describe('A date as YYYY-MM-DD')
const contactId = z.string().describe('A contact id from contacts.search, never a name')
const bookingId = z.string().describe('The booking id from contacts.get or schedule.list_sessions')

export const TOOLS = [
  {
    name: 'contacts.search',
    tier: 'read',
    label: 'Searched contacts',
    description:
      'Find people by name, phone or email, or list everyone with a status. Use it to turn a name into a contact_id before calling any other tool.',
    input: z.object({
      query: z.string().optional().describe('Part of a name, phone number or email. Leave out to list everyone.'),
      status: z.enum(['Lead', 'Customer', 'Past customer']).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    }),
  },
  {
    name: 'contacts.get',
    tier: 'read',
    label: 'Opened a contact',
    description:
      'Everything about one person: status, coach, plans and credits, upcoming sessions, documents, household and what Milton knows about them.',
    input: z.object({ contact_id: contactId }),
  },
  {
    name: 'packages.list',
    tier: 'read',
    label: 'Looked at packages',
    description: 'What the gym sells: packs, memberships, subscriptions and bundles, with prices. Products like water are left out.',
    input: z.object({
      service: z.string().optional().describe('Only packages for this service, for example "Personal training"'),
    }),
  },
  {
    name: 'packages.get',
    tier: 'read',
    label: 'Opened a package',
    description: 'One package or bundle by id, with who currently holds it.',
    input: z.object({ package_id: z.string().describe('A package or bundle id from packages.list') }),
  },
  {
    name: 'schedule.list_sessions',
    tier: 'read',
    label: 'Checked the schedule',
    description:
      'Sessions on a day or a range of up to 14 days, with who is booked and their status. Use for "who is booked tomorrow" or "what is on today".',
    input: z.object({
      from: date,
      to: date.optional().describe('Last day, inclusive. Defaults to from.'),
      coach_id: z.string().optional().describe('A team member id to only show their sessions'),
    }),
  },
  {
    name: 'schedule.get_availability',
    tier: 'read',
    label: 'Checked open times',
    description: 'Open times for one service on one day, with how many people are already booked at each time.',
    input: z.object({
      service_id: z.string().describe('A service id: semi, pt, rr, mass, og, sgt or intro'),
      date,
    }),
  },
  {
    name: 'inbox.list_threads',
    tier: 'read',
    label: 'Checked the Inbox',
    description: 'Conversations in the Inbox with the last message in each. Use filter needs_reply for who is waiting on the team.',
    input: z.object({
      filter: z.enum(['needs_reply', 'milton_handling', 'all']).optional().describe('Defaults to all'),
    }),
  },
  {
    name: 'inbox.get_thread',
    tier: 'read',
    label: 'Read a conversation',
    description: 'The recent messages, calls and notes with one person, oldest first.',
    input: z.object({ contact_id: contactId, limit: z.number().int().min(1).max(40).optional() }),
  },
  {
    name: 'payments.list_transactions',
    tier: 'read',
    label: 'Looked at payments',
    description: 'Payments in a date range, newest first. Filter by person or status.',
    input: z.object({
      from: date,
      to: date,
      contact_id: contactId.optional(),
      status: z.enum(['paid', 'failed', 'refunded', 'all']).optional().describe('Defaults to all'),
    }),
  },
  {
    name: 'payments.list_failed',
    tier: 'read',
    label: 'Looked at failed payments',
    description: 'Payments that failed in a date range, with who and how much. Defaults to this month.',
    input: z.object({ from: date.optional(), to: date.optional() }),
  },
  {
    name: 'leads.list',
    tier: 'read',
    label: 'Looked at leads',
    description: 'People in the CRM pipeline with their stage, source, owner and last touch.',
    input: z.object({
      stage: z.string().optional().describe('Only this stage, for example New, In conversation, Booked, Came in, Joined, Not now'),
    }),
  },
  {
    name: 'leads.get',
    tier: 'read',
    label: 'Opened a lead',
    description: 'One lead: stage, how they came in, their form answers and the last touch.',
    input: z.object({ contact_id: contactId }),
  },
  {
    name: 'workflows.list',
    tier: 'read',
    label: 'Looked at workflows',
    description: 'The gym workflows with status, trigger, audience and steps.',
    input: z.object({ status: z.enum(['Live', 'Draft', 'Paused', 'Archived']).optional() }),
  },
  {
    name: 'workflows.list_templates',
    tier: 'read',
    label: 'Looked at workflow templates',
    description: 'Ready-made workflows the owner can start from.',
    input: z.object({}),
  },
  {
    name: 'reports.revenue',
    tier: 'read',
    label: 'Ran a revenue report',
    description: 'Money collected in a date range, net of failures and refunds, optionally grouped.',
    input: z.object({
      from: date,
      to: date,
      group_by: z.enum(['item', 'team_member', 'source', 'day', 'none']).optional(),
    }),
  },
  {
    name: 'reports.attendance',
    tier: 'read',
    label: 'Ran an attendance report',
    description: 'Check-ins, late cancels and no-shows in a date range, by service.',
    input: z.object({ from: date, to: date }),
  },
  {
    name: 'setup.get',
    tier: 'read',
    label: 'Checked setup',
    description: 'The gym setup checklist. Each step is done, in_progress, not_started or skipped, worked out from real data.',
    input: z.object({}),
  },

  /* Write tools: run straight away, show up in Activity, can be undone. */
  {
    name: 'contacts.create',
    tier: 'write',
    label: 'Added a contact',
    description: 'Add one new person as a Lead. Search first so you never add someone twice.',
    input: z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().optional(),
      source: z.string().optional().describe('How they came in, for example "Walk-in"'),
    }),
  },
  {
    name: 'contacts.update',
    tier: 'write',
    label: 'Updated a contact',
    description: 'Change one person: status, coach, phone, email or tags.',
    input: z.object({
      contact_id: contactId,
      status: z.enum(['Lead', 'Customer', 'Past customer']).optional(),
      coach: z.string().optional().describe('A team member name, or "None"'),
      phone: z.string().optional(),
      email: z.string().optional(),
      add_tags: z.array(z.string()).optional(),
    }),
  },
  {
    name: 'contacts.add_note',
    tier: 'write',
    label: 'Added a note',
    description: 'Leave a private team note on a person. They never see it.',
    input: z.object({ contact_id: contactId, note: z.string().min(1) }),
  },
  {
    name: 'schedule.book_session',
    tier: 'write',
    label: 'Booked a session',
    description: 'Book one person into a service at a time. Uses a credit when they have one, otherwise the session is due. Check availability first.',
    input: z.object({ contact_id: contactId, service_id: z.string(), date, time: z.string().describe('Like "4:00 PM"') }),
  },
  {
    name: 'schedule.cancel_session',
    tier: 'write',
    label: 'Canceled a session',
    description:
      'Cancel one booked session more than 24 hours away. No fee, the credit goes back. Inside 24 hours it fails; use schedule.late_cancel.',
    input: z.object({ contact_id: contactId, booking_id: bookingId }),
  },
  {
    name: 'schedule.reschedule',
    tier: 'write',
    label: 'Rescheduled a session',
    description:
      'Move one booked session to a new day and time, keeping the same booking and credit. Same as Reschedule on the session card. If there is no slot then, it returns no_slot and moves nothing; ask the owner before adding a slot.',
    input: z.object({ contact_id: contactId, booking_id: bookingId, date, time: z.string().describe('Like "8:00 AM"') }),
  },
  {
    name: 'schedule.update_session',
    tier: 'write',
    label: 'Edited a session',
    description:
      'Same as Edit session on the session card: change the day, time or status of one session, with an optional reason. Does not check open slots. Prefer schedule.reschedule to move a booked session.',
    input: z.object({
      contact_id: contactId,
      booking_id: bookingId,
      date: date.optional(),
      time: z.string().optional(),
      status: z.enum(['booked', 'checked_in', 'checked_out', 'late_cancel', 'no_show', 'canceled']).optional(),
      reason: z.string().optional(),
    }),
  },
  {
    name: 'schedule.check_in',
    tier: 'write',
    label: 'Checked someone in',
    description: "Check a client in to one of today's booked sessions. Uses a pack credit.",
    input: z.object({ contact_id: contactId, booking_id: bookingId }),
  },
  {
    name: 'schedule.check_out',
    tier: 'write',
    label: 'Checked someone out',
    description: 'Check a client out of a session they are checked in to. Fails if money is due; that is taken in Point of sale.',
    input: z.object({ contact_id: contactId, booking_id: bookingId }),
  },
  {
    name: 'schedule.late_cancel',
    tier: 'confirm',
    label: 'Late canceled a session',
    description: 'Cancel one booked session inside 24 hours. Uses a pack credit. The owner confirms on a card.',
    input: z.object({ contact_id: contactId, booking_id: bookingId }),
  },
  {
    name: 'schedule.mark_no_show',
    tier: 'confirm',
    label: 'Marked a no show',
    description: 'Mark a booked session that has already started as a no show. Uses a pack credit. The owner confirms on a card.',
    input: z.object({ contact_id: contactId, booking_id: bookingId }),
  },
  {
    name: 'schedule.remove_session',
    tier: 'confirm',
    label: 'Removed a session',
    description: 'Delete a booking made by mistake, with no history. The credit goes back. The owner confirms on a card. To cancel a real session use schedule.cancel_session.',
    input: z.object({ contact_id: contactId, booking_id: bookingId }),
  },
  {
    name: 'milton.cant_do',
    tier: 'always',
    label: 'Could not do',
    description:
      'Call this whenever the owner asks for something no tool can do. It logs the request and opens the screen where the owner can do it themselves. Then say you cannot do it yet and name that screen.',
    input: z.object({
      request: z.string().describe("The owner's request in their words"),
      screen: z.string().describe('Where they can do it, like "schedule", "pos", "payments", "crm/workflows", "settings"'),
      contact_id: contactId.optional(),
      reason: z.string().optional().describe('Why no tool fits, for the team. Not shown to the owner.'),
    }),
  },
  {
    name: 'schedule.add_open_session',
    tier: 'write',
    label: 'Added an open session',
    description: 'Put an open slot for a service on the calendar with nobody booked yet.',
    input: z.object({ service_id: z.string(), date, time: z.string().describe('Like "6:00 AM"') }),
  },
  {
    name: 'inbox.draft_message',
    tier: 'write',
    label: 'Wrote a draft',
    description: 'Open the conversation with a person and put a message in the composer for the owner to read and send. Nothing is sent.',
    input: z.object({ contact_id: contactId, body: z.string().min(1) }),
  },
  {
    name: 'packages.create_draft',
    tier: 'write',
    label: 'Drafted a package',
    description: 'Create a package as a Draft. Nobody can buy it until it is published.',
    input: z.object({
      service_id: z.string(),
      name: z.string().min(1),
      price: z.number().positive(),
      kind: z.enum(['pack', 'membership']).describe('pack is a set number of sessions, membership renews monthly'),
      sessions: z.number().int().positive().optional().describe('Sessions in a pack, or per week for a membership'),
      expires_days: z.number().int().positive().optional(),
    }),
  },
  {
    name: 'workflows.create_draft',
    tier: 'write',
    label: 'Drafted a workflow',
    description: 'Create a workflow as a Draft. It does nothing until it is turned on.',
    input: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      trigger: z.enum(['manual', 'session_booked', 'purchase_completed']),
      steps: z
        .array(
          z.object({
            kind: z.enum(['text', 'email', 'wait']),
            body: z.string().optional(),
            subject: z.string().optional(),
            days: z.number().int().positive().optional(),
          }),
        )
        .min(1),
    }),
  },
  {
    name: 'setup.skip_step',
    tier: 'write',
    label: 'Skipped a setup step',
    description: 'Mark a setup step as skipped when the owner says it does not apply.',
    input: z.object({ step_id: z.string(), reason: z.string() }),
  },
  {
    name: 'ui.open',
    tier: 'write',
    label: 'Opened a screen',
    description: 'Take the owner to a screen, a person, or a workflow.',
    input: z.object({
      screen: z
        .enum(['home', 'schedule', 'inbox', 'crm', 'crm/pipeline', 'crm/workflows', 'clients', 'services', 'payments', 'team', 'settings'])
        .optional(),
      contact_id: contactId.optional(),
      workflow_id: z.string().optional(),
      date: date.optional().describe('For schedule, the day to show'),
    }),
  },

  /* Confirm tools: the owner taps Confirm on a card before anything happens. */
  {
    name: 'inbox.send_message',
    tier: 'confirm',
    label: 'Asked to send a message',
    description: 'Send a text or email to one person. The owner confirms first.',
    input: z.object({ contact_id: contactId, body: z.string().min(1), channel: z.enum(['Text', 'Email']).optional() }),
  },
  {
    name: 'payments.refund',
    tier: 'confirm',
    label: 'Asked to refund',
    description: 'Refund part or all of one payment back to the card. The owner confirms first.',
    input: z.object({ transaction_id: z.string(), amount: z.number().positive().optional().describe('Leave out for a full refund') }),
  },
  {
    name: 'contacts.import',
    tier: 'confirm',
    label: 'Asked to import contacts',
    description: 'Import the member list the owner uploaded. People already in the CRM are skipped. The owner confirms first.',
    input: z.object({}),
  },
  {
    name: 'packages.publish',
    tier: 'confirm',
    label: 'Asked to publish a package',
    description: 'Make a Draft package live so people can buy it. The owner confirms first.',
    input: z.object({ package_id: z.string() }),
  },
  {
    name: 'workflows.turn_on',
    tier: 'confirm',
    label: 'Asked to turn on a workflow',
    description: 'Turn a Draft or Paused workflow on so it starts sending. The owner confirms first.',
    input: z.object({ workflow_id: z.string() }),
  },

  /* Reads for the tools below. */
  {
    name: 'schedule.list_requests',
    tier: 'read',
    label: 'Checked booking requests',
    description: "List who has asked to join today's full class, with their note. Use the client_id with schedule.approve_request or schedule.decline_request.",
    input: z.object({}),
  },
  {
    name: 'contacts.list_duplicates',
    tier: 'read',
    label: 'Checked duplicates',
    description: 'List the pairs of contacts that look like the same person, with a dup_id for contacts.merge.',
    input: z.object({}),
  },
  {
    name: 'pos.list_items',
    tier: 'read',
    label: 'Checked what is for sale',
    description: 'List everything that can be sold in the point of sale, with item_id, price and stock.',
    input: z.object({}),
  },
  {
    name: 'documents.list',
    tier: 'read',
    label: 'Checked documents',
    description: 'List the live documents people sign, like the waiver and membership agreement.',
    input: z.object({}),
  },

  /* Run now, with Undo. */
  {
    name: 'schedule.approve_request',
    tier: 'write',
    label: 'Approved a booking request',
    description:
      "Same as Approve on a booking request: books the person into today's class. Uses a pack credit if they have one; otherwise the session is booked with money due. They are texted. Fails if the room is full.",
    input: z.object({ contact_id: contactId }),
  },
  {
    name: 'contacts.bulk_tag',
    tier: 'write',
    label: 'Tagged people',
    description: 'Add one tag to up to 25 contacts. No message is sent. For more than 25 use contacts.bulk_tag_many.',
    input: z.object({ contact_ids: z.array(contactId).min(1), tag: z.string().min(1) }),
  },
  {
    name: 'workflows.pause',
    tier: 'write',
    label: 'Paused a workflow',
    description: 'Pause a Live workflow. Nothing sends; people part way through wait where they are until it is turned on again. No message is sent.',
    input: z.object({ workflow_id: z.string() }),
  },
  {
    name: 'workflows.archive',
    tier: 'write',
    label: 'Archived a workflow',
    description: 'Stop a workflow for good and move it to Archived. Nobody part way through gets more steps. No message is sent.',
    input: z.object({ workflow_id: z.string() }),
  },
  {
    name: 'payments.resume_membership',
    tier: 'write',
    label: 'Resumed a membership',
    description: 'Resume a paused membership. Charging restarts with the next charge on Dec 20. A note goes on their record; no text is sent.',
    input: z.object({ contact_id: contactId, plan_id: z.string().describe('The plan id from contacts.get') }),
  },
  {
    name: 'payments.create_promo',
    tier: 'write',
    label: 'Created a promo code',
    description:
      'Create a promo code for all packages. Saved as a Draft unless live is true; a live code works at checkout right away. Nobody is messaged.',
    input: z.object({
      code: z.string().min(1).describe('Letters and numbers only, like FALL20'),
      name: z.string().optional(),
      type: z.enum(['percent', 'amount']),
      value: z.number().positive().describe('Percent off, or dollars off'),
      live: z.boolean().optional().describe('Only true if the owner said to make it live now'),
    }),
  },

  /* The owner confirms on a card first. */
  {
    name: 'schedule.decline_request',
    tier: 'confirm',
    label: 'Asked to decline a request',
    description: 'Decline a booking request. They are texted that there is no spot. Nothing is charged and no credit is touched.',
    input: z.object({ contact_id: contactId }),
  },
  {
    name: 'schedule.take_payment',
    tier: 'confirm',
    label: 'Asked to take payment',
    description: 'Take the amount due on one session, by the card on file or cash. Same as Take payment on the session card. Checks them out if they are checked in.',
    input: z.object({ contact_id: contactId, booking_id: bookingId, method: z.enum(['card', 'cash']).optional() }),
  },
  {
    name: 'schedule.renew_package',
    tier: 'confirm',
    label: 'Asked to renew a package',
    description: 'Sell a client their package again, by the card on file or cash. Same as Renew on the session card.',
    input: z.object({ contact_id: contactId, plan_id: z.string(), method: z.enum(['card', 'cash']).optional() }),
  },
  {
    name: 'pos.take_sale',
    tier: 'confirm',
    label: 'Asked to take a sale',
    description: 'Charge a client for items from pos.list_items, by the card on file or cash. Same records as Charge in the point of sale.',
    input: z.object({
      contact_id: contactId,
      items: z.array(z.object({ item_id: z.string(), qty: z.number().int().positive().optional() })).min(1),
      method: z.enum(['card', 'cash']).optional(),
    }),
  },
  {
    name: 'contacts.merge',
    tier: 'confirm',
    label: 'Asked to merge contacts',
    description: 'Merge a duplicate pair from contacts.list_duplicates into one contact. The other record is removed. No message is sent.',
    input: z.object({ dup_id: z.string(), keep_id: contactId.optional().describe('Which one to keep. Leave out to keep the suggested one.') }),
  },
  {
    name: 'contacts.bulk_tag_many',
    tier: 'confirm',
    label: 'Asked to tag many people',
    description: 'Add one tag to more than 25 contacts. No message is sent.',
    input: z.object({ contact_ids: z.array(contactId).min(1), tag: z.string().min(1) }),
  },
  {
    name: 'payments.pause_membership',
    tier: 'confirm',
    label: 'Asked to pause a membership',
    description:
      'Pause a membership. No charges until it resumes; they keep what is already paid for. No text is sent. Pass the reason and note if the owner gave them; the card asks for anything missing.',
    input: z.object({ contact_id: contactId, plan_id: z.string(), reason: z.string().optional(), note: z.string().optional() }),
  },
  {
    name: 'payments.cancel_membership',
    tier: 'confirm',
    label: 'Asked to cancel a membership',
    description:
      'Cancel a membership. Nothing more is charged; they keep access through what is already paid for. No text is sent. Pass the reason and note if the owner gave them; the card asks for anything missing.',
    input: z.object({ contact_id: contactId, plan_id: z.string(), reason: z.string().optional(), note: z.string().optional() }),
  },
  {
    name: 'documents.send',
    tier: 'confirm',
    label: 'Asked to send documents',
    description: 'Text each person one private signing link for everything they still owe. Nothing is charged. People who cannot get texts are skipped.',
    input: z.object({
      contact_ids: z.array(contactId).min(1),
      scope: z.string().optional().describe('Leave out to send everything they owe, or one document_id from documents.list'),
    }),
  },
]

export const TOOL_BY_NAME = Object.fromEntries(TOOLS.map((t) => [t.name, t]))

/* Model providers only allow [a-zA-Z0-9_-] in tool names, so the dot travels as "__". */
export const toWire = (name) => name.replace('.', '__')
export const fromWire = (wire) => wire.replace('__', '.')
