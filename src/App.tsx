import { useState } from 'react'
import { 
  ChevronLeft, 
  MessageCircle, 
  FileText, 
  Flame, 
  Calendar, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Send,
  Dumbbell,
  Utensils,
  Moon,
  Footprints
} from 'lucide-react'

// Types
interface Session {
  id: string
  date: string
  time: string
  type: string
  isToday?: boolean
}

interface DayActivity {
  date: string
  categories: string[]
  intensity: number
}

interface Metric {
  label: string
  value: string
  target?: string
  progress?: number
  hit?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Mock Data
const clientData = {
  name: 'Sarah Johnson',
  avatar: '/placeholder.svg?height=80&width=80',
  program: 'Fat Loss',
  streak: 12,
  sessionsThisWeek: 3,
  totalSessions: 47,
  lastSession: '2 days ago',
  goalProgress: 68,
  goalLabel: '68% to goal weight',
  profile: {
    age: 32,
    height: "5'6\"",
    startWeight: '165 lbs',
    currentWeight: '152 lbs',
    goalWeight: '145 lbs',
    bodyFat: '28%',
    trainingDays: 4,
    sessionLength: '60 min',
    focus: 'Strength + HIIT',
    benchPress: { current: '95 lbs', baseline: '75 lbs', change: '+27%' },
    squat: { current: '135 lbs', baseline: '95 lbs', change: '+42%' },
    deadlift: { current: '155 lbs', baseline: '115 lbs', change: '+35%' },
    coachNotes: 'Sarah has been incredibly consistent. Focus on progressive overload for squats. She responds well to AMRAP finishers. Prefers morning sessions.'
  }
}

const upcomingSessions: Session[] = [
  { id: '1', date: 'Today', time: '9:00 AM', type: 'Strength', isToday: true },
  { id: '2', date: 'Thu', time: '9:00 AM', type: 'HIIT' },
  { id: '3', date: 'Sat', time: '10:00 AM', type: 'Full Body' },
]

const generateActivityData = (): DayActivity[] => {
  const data: DayActivity[] = []
  const categories = ['workout', 'nutrition', 'sleep', 'steps']
  const today = new Date()
  
  for (let i = 34; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const numCategories = Math.floor(Math.random() * 5)
    const dayCategories = categories.slice(0, numCategories)
    data.push({
      date: date.toISOString().split('T')[0],
      categories: dayCategories,
      intensity: numCategories
    })
  }
  return data
}

const activityData = generateActivityData()

const nutritionMetrics: Metric[] = [
  { label: 'Calories', value: '1,847', target: '1,900', progress: 97, hit: true },
  { label: 'Protein', value: '142g', target: '140g', progress: 100, hit: true },
  { label: 'Carbs', value: '185g', target: '200g', progress: 93, hit: true },
  { label: 'Fat', value: '58g', target: '60g', progress: 97, hit: true },
  { label: 'Fiber', value: '22g', target: '30g', progress: 73, hit: false },
  { label: 'Water', value: '2.1L', target: '2.5L', progress: 84, hit: false },
]

const activityMetrics: Metric[] = [
  { label: 'Steps', value: '8,432', target: '10,000', progress: 84, hit: false },
  { label: 'Active Calories', value: '487', target: '500', progress: 97, hit: true },
  { label: 'Workout Duration', value: '52 min', target: '45 min', progress: 100, hit: true },
  { label: 'Heart Rate Avg', value: '142 bpm', target: '140 bpm', progress: 100, hit: true },
  { label: 'Distance', value: '4.2 mi', target: '5 mi', progress: 84, hit: false },
  { label: 'Floors Climbed', value: '12', target: '10', progress: 100, hit: true },
]

const sleepMetrics: Metric[] = [
  { label: 'Duration', value: '7h 23m', target: '8h', progress: 92, hit: true },
  { label: 'Deep Sleep', value: '1h 45m', target: '1h 30m', progress: 100, hit: true },
  { label: 'REM Sleep', value: '1h 52m', target: '2h', progress: 93, hit: true },
  { label: 'Sleep Score', value: '84', target: '85', progress: 99, hit: false },
  { label: 'Resting HR', value: '58 bpm', target: '60 bpm', progress: 100, hit: true },
  { label: 'HRV', value: '45 ms', target: '50 ms', progress: 90, hit: false },
]

// Components
function HeaderCard({ onOpenChat }: { onOpenChat: (prompt?: string) => void }) {
  return (
    <div className="bg-card rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img 
            src={clientData.avatar} 
            alt={clientData.name}
            className="w-16 h-16 rounded-full bg-muted"
          />
          <div>
            <h1 className="text-2xl font-semibold">{clientData.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-sm rounded-full">
                {clientData.program}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent text-sm rounded-full">
                <Flame className="w-3 h-3" />
                {clientData.streak} day streak
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onOpenChat('Generate a progress report for Sarah')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </div>
      
      <div className="flex items-center gap-6 flex-wrap">
        <StatChip icon={Calendar} label="This Week" value={`${clientData.sessionsThisWeek} sessions`} />
        <StatChip icon={Target} label="Total" value={`${clientData.totalSessions} sessions`} />
        <StatChip icon={Clock} label="Last Session" value={clientData.lastSession} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Goal Progress</span>
            <span className="text-primary font-medium">{clientData.goalLabel}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${clientData.goalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 bg-muted rounded-lg">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function UpcomingSessions() {
  return (
    <div className="bg-card rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {upcomingSessions.map((session) => (
          <div 
            key={session.id}
            className={`flex-shrink-0 p-4 rounded-lg border-2 min-w-[140px] ${
              session.isToday 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-muted/50'
            }`}
          >
            <p className={`font-semibold ${session.isToday ? 'text-primary' : ''}`}>
              {session.date}
            </p>
            <p className="text-sm text-muted-foreground">{session.time}</p>
            <p className="text-sm mt-2">{session.type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityHeatmap() {
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null)
  const weeks: DayActivity[][] = []
  
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7))
  }
  
  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-muted'
    if (intensity === 1) return 'bg-primary/25'
    if (intensity === 2) return 'bg-primary/50'
    if (intensity === 3) return 'bg-primary/75'
    return 'bg-primary'
  }
  
  const today = new Date().toISOString().split('T')[0]
  
  const categoryIcons: Record<string, any> = {
    workout: Dumbbell,
    nutrition: Utensils,
    sleep: Moon,
    steps: Footprints
  }

  return (
    <div className="bg-card rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">30-Day Activity</h2>
      <div className="flex gap-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(selectedDay?.date === day.date ? null : day)}
                className={`w-6 h-6 rounded-sm transition-all ${getIntensityColor(day.intensity)} ${
                  day.date === today ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''
                } ${selectedDay?.date === day.date ? 'scale-110' : 'hover:scale-105'}`}
                title={day.date}
              />
            ))}
          </div>
        ))}
      </div>
      
      {selectedDay && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <div className="flex gap-2 flex-wrap">
            {selectedDay.categories.length > 0 ? (
              selectedDay.categories.map((cat) => {
                const Icon = categoryIcons[cat]
                return (
                  <span key={cat} className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full capitalize">
                    {Icon && <Icon className="w-3 h-3" />}
                    {cat}
                  </span>
                )
              })
            ) : (
              <span className="text-sm text-muted-foreground">No activity logged</span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${getIntensityColor(i)}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

function ProfileBaselines() {
  const [expanded, setExpanded] = useState(false)
  const { profile } = clientData
  
  return (
    <div className="bg-card rounded-xl p-6">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-lg font-semibold">Profile & Baselines</h2>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {!expanded && (
        <p className="text-sm text-muted-foreground mt-2">
          {profile.age}yo • {profile.height} • {profile.currentWeight} • {profile.trainingDays}x/week • {profile.focus}
        </p>
      )}
      
      {expanded && (
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem label="Age" value={`${profile.age}`} />
            <InfoItem label="Height" value={profile.height} />
            <InfoItem label="Start Weight" value={profile.startWeight} />
            <InfoItem label="Current Weight" value={profile.currentWeight} />
            <InfoItem label="Goal Weight" value={profile.goalWeight} />
            <InfoItem label="Body Fat" value={profile.bodyFat} />
            <InfoItem label="Training Days" value={`${profile.trainingDays}/week`} />
            <InfoItem label="Session Length" value={profile.sessionLength} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Strength Baselines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaselineItem label="Bench Press" current={profile.benchPress.current} baseline={profile.benchPress.baseline} change={profile.benchPress.change} />
              <BaselineItem label="Squat" current={profile.squat.current} baseline={profile.squat.baseline} change={profile.squat.change} />
              <BaselineItem label="Deadlift" current={profile.deadlift.current} baseline={profile.deadlift.baseline} change={profile.deadlift.change} />
            </div>
          </div>
          
          <div className="border-l-2 border-primary pl-4">
            <h3 className="text-sm font-medium mb-1">Coach Notes</h3>
            <p className="text-sm text-muted-foreground">{profile.coachNotes}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function BaselineItem({ label, current, baseline, change }: { label: string, current: string, baseline: string, change: string }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-lg font-semibold text-primary">{current}</p>
      <p className="text-xs text-muted-foreground">
        Baseline: {baseline} <span className="text-green-400">{change}</span>
      </p>
    </div>
  )
}

function DailyBreakdown() {
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today')
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daily Breakdown</h2>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['today', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                period === p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'
              }`}
            >
              {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Nutrition" icon={Utensils} metrics={nutritionMetrics} />
        <MetricCard title="Activity" icon={Dumbbell} metrics={activityMetrics} />
        <MetricCard title="Sleep" icon={Moon} metrics={sleepMetrics} />
      </div>
    </div>
  )
}

function MetricCard({ title, icon: Icon, metrics }: { title: string, icon: any, metrics: Metric[] }) {
  const hitsCount = metrics.filter(m => m.hit).length
  
  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{hitsCount}/{metrics.length} targets hit</span>
      </div>
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{metric.value}</span>
                {metric.hit ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  metric.hit ? 'bg-green-400' : 'bg-primary/50'
                }`}
                style={{ width: `${Math.min(metric.progress || 0, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatSidebar({ isOpen, onClose, initialPrompt }: { isOpen: boolean, onClose: () => void, initialPrompt?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm Milton, your AI coaching assistant. How can I help you with Sarah's progress today?" }
  ])
  const [input, setInput] = useState(initialPrompt || '')
  
  const handleSend = () => {
    if (!input.trim()) return
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on Sarah's data, she's been making excellent progress. Her consistency is at 92% this month, and her strength gains are above average for her program.",
        "I can see Sarah has logged all her meals this week. Her protein intake is consistently hitting targets, which is great for muscle recovery.",
        "Looking at Sarah's sleep patterns, she's averaging 7.2 hours. Improving this to 8 hours could accelerate her recovery and fat loss progress."
      ]
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)]
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Milton</h3>
                <p className="text-xs text-muted-foreground">AI Coach Assistant</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Sarah's progress..."
                className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string>()
  
  const openChat = (prompt?: string) => {
    setChatPrompt(prompt)
    setChatOpen(true)
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <HeaderCard onOpenChat={openChat} />
        <UpcomingSessions />
        <ActivityHeatmap />
        <ProfileBaselines />
        <DailyBreakdown />
      </div>
      
      <button
        onClick={() => openChat()}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 z-30"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} initialPrompt={chatPrompt} />
    </div>
  )
}
