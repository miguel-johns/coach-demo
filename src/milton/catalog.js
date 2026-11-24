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
]

export const TOOL_BY_NAME = Object.fromEntries(TOOLS.map((t) => [t.name, t]))

/* Model providers only allow [a-zA-Z0-9_-] in tool names, so the dot travels as "__". */
export const toWire = (name) => name.replace('.', '__')
export const fromWire = (wire) => wire.replace('__', '.')
