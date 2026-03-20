import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

// Design tokens matching coach dashboard
const TEAL = "#2B7A78";
const MINT = "#5CDB95";
const TEAL_LIGHT = "#e8f5f3";
const SAGE = "#3aafa9";
const BG = "#f3f6f4";
const WHITE = "#ffffff";
const TEXT = "#1a2e2a";
const TEXT_SEC = "#5f7a76";
const CHAT_BG = "#f7faf9";
const BORDER = "#e0ebe8";
const USER_BUBBLE = "#2B7A78";
const ALERT_RED = "#e8453c";
const ALERT_YELLOW = "#f5a623";
const ALERT_GREEN = "#3aaf6a";
const ALERT_BLUE = "#3a7aaf";
const MOBILE_BP = 768;

// Quadrant colors for ROI Matrix
const QUADRANT_COLORS = {
  star: "#22c55e",       // Green - high financial, high outcomes
  salesperson: "#f59e0b", // Amber - high financial, low outcomes
  hiddenGem: "#3b82f6",   // Blue - low financial, high outcomes
  underperformer: "#ef4444" // Red - low financial, low outcomes
};

// Demo trainer data
const trainersData = [
  {
    id: 1,
    name: "Jordan Mitchell",
    avatar: "JM",
    financialScore: 92,
    outcomesScore: 88,
    quadrant: "star",
    revenue: 18500,
    sessions: 48,
    packages: 6,
    clientLTV: 4200,
    activeClients: 12,
    retentionRate: 94,
    loggingCompliance: 85,
    nutritionAdherence: 78,
    milestones: 14,
    churnRisk: 2,
    utilizationRate: 88,
    availableSlots: 4
  },
  {
    id: 2,
    name: "Alex Rivera",
    avatar: "AR",
    financialScore: 85,
    outcomesScore: 72,
    quadrant: "salesperson",
    revenue: 15200,
    sessions: 52,
    packages: 8,
    clientLTV: 3100,
    activeClients: 16,
    retentionRate: 78,
    loggingCompliance: 62,
    nutritionAdherence: 58,
    milestones: 8,
    churnRisk: 5,
    utilizationRate: 95,
    availableSlots: 2
  },
  {
    id: 3,
    name: "Sam Patel",
    avatar: "SP",
    financialScore: 58,
    outcomesScore: 91,
    quadrant: "hiddenGem",
    revenue: 9800,
    sessions: 32,
    packages: 3,
    clientLTV: 5100,
    activeClients: 8,
    retentionRate: 96,
    loggingCompliance: 92,
    nutritionAdherence: 88,
    milestones: 18,
    churnRisk: 1,
    utilizationRate: 65,
    availableSlots: 12
  },
  {
    id: 4,
    name: "Taylor Kim",
    avatar: "TK",
    financialScore: 45,
    outcomesScore: 42,
    quadrant: "underperformer",
    revenue: 6200,
    sessions: 24,
    packages: 2,
    clientLTV: 2200,
    activeClients: 6,
    retentionRate: 65,
    loggingCompliance: 48,
    nutritionAdherence: 42,
    milestones: 3,
    churnRisk: 4,
    utilizationRate: 52,
    availableSlots: 18
  },
  {
    id: 5,
    name: "Morgan Chen",
    avatar: "MC",
    financialScore: 78,
    outcomesScore: 82,
    quadrant: "star",
    revenue: 14200,
    sessions: 44,
    packages: 5,
    clientLTV: 3800,
    activeClients: 11,
    retentionRate: 89,
    loggingCompliance: 79,
    nutritionAdherence: 75,
    milestones: 12,
    churnRisk: 2,
    utilizationRate: 82,
    availableSlots: 6
  },
  {
    id: 6,
    name: "Casey Brooks",
    avatar: "CB",
    financialScore: 68,
    outcomesScore: 55,
    quadrant: "salesperson",
    revenue: 11800,
    sessions: 38,
    packages: 4,
    clientLTV: 2900,
    activeClients: 10,
    retentionRate: 72,
    loggingCompliance: 55,
    nutritionAdherence: 52,
    milestones: 6,
    churnRisk: 4,
    utilizationRate: 78,
    availableSlots: 8
  }
];

// Program data
const programsData = [
  { name: "Fat Loss Phase", enrolled: 28, revenue: 42000, completionRate: 82, avgOutcome: 8.2, trend: "up" },
  { name: "Muscle Gain", enrolled: 22, revenue: 35200, completionRate: 78, avgOutcome: 7.8, trend: "up" },
  { name: "Metabolic Health", enrolled: 18, revenue: 27000, completionRate: 85, avgOutcome: 8.5, trend: "stable" },
  { name: "Post-Pregnancy", enrolled: 12, revenue: 19200, completionRate: 90, avgOutcome: 9.1, trend: "up" },
  { name: "Athletic Performance", enrolled: 15, revenue: 30000, completionRate: 72, avgOutcome: 7.2, trend: "down" }
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= MOBILE_BP : true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    h();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

// Icons
function Icon({ icon, size = 20 }) {
  const s = { width: size, height: size, strokeWidth: 1.6, stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    grid: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    users: <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    chart: <svg {...s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    dollar: <svg {...s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    target: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    alert: <svg {...s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    calendar: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    trendUp: <svg {...s} viewBox="0 0 24 24"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
    trendDown: <svg {...s} viewBox="0 0 24 24"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></svg>,
    send: <svg {...s} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    menu: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevronLeft: <svg {...s} viewBox="0 0 24 24" style={{...s, width: 18, height: 18}}><polyline points="15,18 9,12 15,6"/></svg>,
    message: <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    clock: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  };
  return icons[icon] || null;
}

// Card component
function Card({ children, style = {}, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: WHITE,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        padding: 20,
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ROI Matrix (Scatter Plot)
function ROIMatrix({ trainers, selectedTrainer, onSelectTrainer }) {
  const matrixRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (matrixRef.current) {
      const rect = matrixRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: Math.min(rect.width * 0.75, 350) });
    }
  }, []);

  const padding = 50;
  const plotWidth = dimensions.width - padding * 2;
  const plotHeight = dimensions.height - padding * 2;

  const getX = (score) => padding + (score / 100) * plotWidth;
  const getY = (score) => dimensions.height - padding - (score / 100) * plotHeight;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: TEXT }}>Trainer ROI Matrix</h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: TEXT_SEC }}>Financial Return vs Outcomes Return</p>
      </div>
      
      <div ref={matrixRef} style={{ padding: 16, position: "relative" }}>
        <svg width={dimensions.width} height={dimensions.height} style={{ display: "block" }}>
          {/* Quadrant backgrounds */}
          <rect x={padding} y={padding} width={plotWidth/2} height={plotHeight/2} fill={`${QUADRANT_COLORS.hiddenGem}10`} />
          <rect x={padding + plotWidth/2} y={padding} width={plotWidth/2} height={plotHeight/2} fill={`${QUADRANT_COLORS.star}10`} />
          <rect x={padding} y={padding + plotHeight/2} width={plotWidth/2} height={plotHeight/2} fill={`${QUADRANT_COLORS.underperformer}10`} />
          <rect x={padding + plotWidth/2} y={padding + plotHeight/2} width={plotWidth/2} height={plotHeight/2} fill={`${QUADRANT_COLORS.salesperson}10`} />
          
          {/* Grid lines */}
          <line x1={padding} y1={dimensions.height - padding} x2={dimensions.width - padding} y2={dimensions.height - padding} stroke={BORDER} strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={dimensions.height - padding} stroke={BORDER} strokeWidth="1" />
          
          {/* Center lines */}
          <line x1={padding + plotWidth/2} y1={padding} x2={padding + plotWidth/2} y2={dimensions.height - padding} stroke={BORDER} strokeWidth="1" strokeDasharray="4,4" />
          <line x1={padding} y1={padding + plotHeight/2} x2={dimensions.width - padding} y2={padding + plotHeight/2} stroke={BORDER} strokeWidth="1" strokeDasharray="4,4" />
          
          {/* Quadrant labels */}
          <text x={padding + plotWidth * 0.25} y={padding + 20} textAnchor="middle" fontSize="11" fill={QUADRANT_COLORS.hiddenGem} fontWeight="600">Hidden Gems</text>
          <text x={padding + plotWidth * 0.75} y={padding + 20} textAnchor="middle" fontSize="11" fill={QUADRANT_COLORS.star} fontWeight="600">Stars</text>
          <text x={padding + plotWidth * 0.25} y={dimensions.height - padding - 10} textAnchor="middle" fontSize="11" fill={QUADRANT_COLORS.underperformer} fontWeight="600">Underperformers</text>
          <text x={padding + plotWidth * 0.75} y={dimensions.height - padding - 10} textAnchor="middle" fontSize="11" fill={QUADRANT_COLORS.salesperson} fontWeight="600">Salespeople</text>
          
          {/* Axis labels */}
          <text x={dimensions.width / 2} y={dimensions.height - 10} textAnchor="middle" fontSize="12" fill={TEXT_SEC}>Financial Return →</text>
          <text x={15} y={dimensions.height / 2} textAnchor="middle" fontSize="12" fill={TEXT_SEC} transform={`rotate(-90, 15, ${dimensions.height / 2})`}>Outcomes Return →</text>
          
          {/* Trainer dots */}
          {trainers.map((trainer) => (
            <g key={trainer.id} onClick={() => onSelectTrainer(trainer)} style={{ cursor: "pointer" }}>
              <circle
                cx={getX(trainer.financialScore)}
                cy={getY(trainer.outcomesScore)}
                r={selectedTrainer?.id === trainer.id ? 14 : 10}
                fill={QUADRANT_COLORS[trainer.quadrant]}
                stroke={WHITE}
                strokeWidth={2}
                opacity={selectedTrainer && selectedTrainer.id !== trainer.id ? 0.4 : 1}
              />
              <text
                x={getX(trainer.financialScore)}
                y={getY(trainer.outcomesScore) + 4}
                textAnchor="middle"
                fontSize="9"
                fill={WHITE}
                fontWeight="600"
              >
                {trainer.avatar}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Legend */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: "Stars", color: QUADRANT_COLORS.star },
            { label: "Salespeople", color: QUADRANT_COLORS.salesperson },
            { label: "Hidden Gems", color: QUADRANT_COLORS.hiddenGem },
            { label: "Underperformers", color: QUADRANT_COLORS.underperformer },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
              <span style={{ fontSize: 11, color: TEXT_SEC }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Revenue Attribution Panel
function RevenueAttribution({ trainers, selectedTrainer }) {
  const sortedTrainers = [...trainers].sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = Math.max(...trainers.map(t => t.revenue));

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ color: TEAL }}><Icon icon="dollar" size={18} /></div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>Revenue Attribution</h3>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sortedTrainers.map((trainer) => (
          <div 
            key={trainer.id}
            style={{
              padding: 12,
              borderRadius: 10,
              background: selectedTrainer?.id === trainer.id ? TEAL_LIGHT : BG,
              border: selectedTrainer?.id === trainer.id ? `1px solid ${TEAL}` : `1px solid transparent`,
              transition: "all 0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: QUADRANT_COLORS[trainer.quadrant],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: WHITE
                }}>
                  {trainer.avatar}
                </div>
                <span style={{ fontWeight: 500, color: TEXT, fontSize: 14 }}>{trainer.name}</span>
              </div>
              <span style={{ fontWeight: 600, color: TEAL, fontSize: 15 }}>${trainer.revenue.toLocaleString()}</span>
            </div>
            
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_SEC }}>
              <span>{trainer.sessions} sessions</span>
              <span>{trainer.packages} packages</span>
              <span>LTV ${trainer.clientLTV.toLocaleString()}</span>
            </div>
            
            <div style={{ marginTop: 8, height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(trainer.revenue / maxRevenue) * 100}%`,
                background: QUADRANT_COLORS[trainer.quadrant],
                borderRadius: 2,
                transition: "width 0.3s"
              }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Member Retention Radar
function RetentionRadar({ trainers }) {
  const atRiskClients = trainers.flatMap(t => 
    Array(t.churnRisk).fill(null).map((_, i) => ({
      trainer: t.name,
      trainerAvatar: t.avatar,
      quadrant: t.quadrant,
      clientId: `${t.id}-${i}`,
      riskLevel: Math.random() > 0.5 ? "high" : "medium",
      reason: ["No login 7+ days", "Missed 3 sessions", "Low compliance", "Payment issue"][Math.floor(Math.random() * 4)]
    }))
  );

  const highRisk = atRiskClients.filter(c => c.riskLevel === "high");
  const mediumRisk = atRiskClients.filter(c => c.riskLevel === "medium");

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ color: ALERT_RED }}><Icon icon="alert" size={18} /></div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>Member Retention Risk</h3>
      </div>
      
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, padding: 12, background: `${ALERT_RED}10`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: ALERT_RED }}>{highRisk.length}</div>
          <div style={{ fontSize: 12, color: TEXT_SEC }}>High Risk</div>
        </div>
        <div style={{ flex: 1, padding: 12, background: `${ALERT_YELLOW}10`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: ALERT_YELLOW }}>{mediumRisk.length}</div>
          <div style={{ fontSize: 12, color: TEXT_SEC }}>Medium Risk</div>
        </div>
      </div>
      
      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, marginBottom: 8 }}>At-Risk by Trainer</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {trainers.filter(t => t.churnRisk > 0).sort((a, b) => b.churnRisk - a.churnRisk).map(trainer => (
          <div key={trainer.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", background: BG, borderRadius: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: QUADRANT_COLORS[trainer.quadrant],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 600, color: WHITE
              }}>
                {trainer.avatar}
              </div>
              <span style={{ fontSize: 13, color: TEXT }}>{trainer.name}</span>
            </div>
            <div style={{
              padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
              background: trainer.churnRisk > 3 ? `${ALERT_RED}20` : `${ALERT_YELLOW}20`,
              color: trainer.churnRisk > 3 ? ALERT_RED : ALERT_YELLOW
            }}>
              {trainer.churnRisk} at risk
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Program P&L
function ProgramPL({ programs }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ color: TEAL }}><Icon icon="chart" size={18} /></div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>Program P&L</h3>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {programs.map((program, idx) => (
          <div key={idx} style={{ padding: 12, background: BG, borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 500, color: TEXT, fontSize: 14 }}>{program.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {program.trend === "up" && <span style={{ color: ALERT_GREEN }}><Icon icon="trendUp" size={14} /></span>}
                {program.trend === "down" && <span style={{ color: ALERT_RED }}><Icon icon="trendDown" size={14} /></span>}
                <span style={{ fontWeight: 600, color: TEAL }}>${(program.revenue / 1000).toFixed(1)}k</span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_SEC }}>
              <span>{program.enrolled} enrolled</span>
              <span>{program.completionRate}% completion</span>
              <span>{program.avgOutcome}/10 outcome</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Capacity & Utilization
function CapacityUtilization({ trainers }) {
  const totalCapacity = trainers.reduce((sum, t) => sum + t.availableSlots + Math.round(t.utilizationRate * 0.4), 0);
  const usedCapacity = trainers.reduce((sum, t) => sum + Math.round(t.utilizationRate * 0.4), 0);
  const overallUtilization = Math.round((usedCapacity / totalCapacity) * 100);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ color: TEAL }}><Icon icon="clock" size={18} /></div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>Capacity & Utilization</h3>
      </div>
      
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: TEAL }}>{overallUtilization}%</div>
        <div style={{ fontSize: 13, color: TEXT_SEC }}>Overall Team Utilization</div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {trainers.sort((a, b) => b.utilizationRate - a.utilizationRate).map(trainer => (
          <div key={trainer.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: QUADRANT_COLORS[trainer.quadrant],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 600, color: WHITE
                }}>
                  {trainer.avatar}
                </div>
                <span style={{ fontSize: 13, color: TEXT }}>{trainer.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: TEXT_SEC }}>{trainer.availableSlots} slots open</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: trainer.utilizationRate > 90 ? ALERT_RED : trainer.utilizationRate > 70 ? ALERT_GREEN : TEXT_SEC }}>
                  {trainer.utilizationRate}%
                </span>
              </div>
            </div>
            <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${trainer.utilizationRate}%`,
                background: trainer.utilizationRate > 90 ? ALERT_RED : trainer.utilizationRate > 70 ? ALERT_GREEN : SAGE,
                borderRadius: 2
              }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Trainer Detail Panel
function TrainerDetail({ trainer, onClose }) {
  if (!trainer) return null;
  
  return (
    <Card style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: QUADRANT_COLORS[trainer.quadrant],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 600, color: WHITE
          }}>
            {trainer.avatar}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: TEXT }}>{trainer.name}</h3>
            <span style={{
              display: "inline-block", marginTop: 4, padding: "2px 8px",
              borderRadius: 10, fontSize: 11, fontWeight: 600,
              background: `${QUADRANT_COLORS[trainer.quadrant]}20`,
              color: QUADRANT_COLORS[trainer.quadrant]
            }}>
              {trainer.quadrant === "star" ? "Star Performer" : 
               trainer.quadrant === "salesperson" ? "High Revenue, Low Outcomes" :
               trainer.quadrant === "hiddenGem" ? "Hidden Gem" : "Needs Development"}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_SEC }}
        >
          <Icon icon="x" size={18} />
        </button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: 12, background: WHITE, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: TEXT_SEC, marginBottom: 4 }}>Financial Score</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TEAL }}>{trainer.financialScore}/100</div>
        </div>
        <div style={{ padding: 12, background: WHITE, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: TEXT_SEC, marginBottom: 4 }}>Outcomes Score</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: SAGE }}>{trainer.outcomesScore}/100</div>
        </div>
        <div style={{ padding: 12, background: WHITE, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: TEXT_SEC, marginBottom: 4 }}>Active Clients</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>{trainer.activeClients}</div>
        </div>
        <div style={{ padding: 12, background: WHITE, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: TEXT_SEC, marginBottom: 4 }}>Retention Rate</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: trainer.retentionRate > 85 ? ALERT_GREEN : ALERT_YELLOW }}>{trainer.retentionRate}%</div>
        </div>
      </div>
      
      <div style={{ marginTop: 16, padding: 12, background: WHITE, borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Client Outcomes</div>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_SEC }}>
          <div>
            <span style={{ fontWeight: 600, color: TEXT }}>{trainer.loggingCompliance}%</span> logging
          </div>
          <div>
            <span style={{ fontWeight: 600, color: TEXT }}>{trainer.nutritionAdherence}%</span> nutrition
          </div>
          <div>
            <span style={{ fontWeight: 600, color: TEXT }}>{trainer.milestones}</span> milestones
          </div>
        </div>
      </div>
    </Card>
  );
}

// AI Copilot Panel
function DirectorCopilot({ trainers, selectedTrainer }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to the Director Dashboard. I can help you analyze trainer performance, identify staffing opportunities, and optimize your team's ROI. What would you like to explore?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/director-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          trainers,
          selectedTrainer,
          context: "director"
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              assistantMessage += text;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: "assistant", content: assistantMessage };
                return newMessages;
              });
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}>
      <div style={{ 
        padding: "14px 16px", 
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: "50%", 
          background: `linear-gradient(135deg, ${TEAL}, ${MINT})`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon icon="message" size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: TEXT }}>Director Copilot</div>
          <div style={{ fontSize: 11, color: TEXT_SEC }}>AI-powered insights</div>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? TEAL : BG,
              color: msg.role === "user" ? WHITE : TEXT,
              fontSize: 14,
              lineHeight: 1.5
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: BG }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div 
                    key={i}
                    style={{
                      width: 6, height: 6, borderRadius: "50%", background: TEXT_SEC,
                      animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} style={{ padding: 12, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trainer performance..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 20,
              border: `1px solid ${BORDER}`, fontSize: 14,
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: input.trim() ? TEAL : BG,
              border: "none", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: input.trim() ? WHITE : TEXT_SEC
            }}
          >
            <Icon icon="send" size={16} />
          </button>
        </div>
      </form>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </Card>
  );
}

// Summary Stats
function SummaryStats({ trainers, programs }) {
  const totalRevenue = trainers.reduce((sum, t) => sum + t.revenue, 0);
  const avgRetention = Math.round(trainers.reduce((sum, t) => sum + t.retentionRate, 0) / trainers.length);
  const totalClients = trainers.reduce((sum, t) => sum + t.activeClients, 0);
  const avgUtilization = Math.round(trainers.reduce((sum, t) => sum + t.utilizationRate, 0) / trainers.length);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {[
        { label: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: "dollar", color: TEAL },
        { label: "Avg Retention", value: `${avgRetention}%`, icon: "users", color: ALERT_GREEN },
        { label: "Active Clients", value: totalClients, icon: "target", color: SAGE },
        { label: "Utilization", value: `${avgUtilization}%`, icon: "clock", color: MINT },
      ].map((stat, idx) => (
        <Card key={idx} style={{ padding: 16, textAlign: "center" }}>
          <div style={{ color: stat.color, marginBottom: 8 }}><Icon icon={stat.icon} size={22} /></div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>{stat.value}</div>
          <div style={{ fontSize: 12, color: TEXT_SEC }}>{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}

// Mobile Summary Stats
function MobileSummaryStats({ trainers }) {
  const totalRevenue = trainers.reduce((sum, t) => sum + t.revenue, 0);
  const avgRetention = Math.round(trainers.reduce((sum, t) => sum + t.retentionRate, 0) / trainers.length);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
      <Card style={{ padding: 14, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: TEAL }}>${(totalRevenue / 1000).toFixed(1)}k</div>
        <div style={{ fontSize: 11, color: TEXT_SEC }}>Total Revenue</div>
      </Card>
      <Card style={{ padding: 14, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: ALERT_GREEN }}>{avgRetention}%</div>
        <div style={{ fontSize: 11, color: TEXT_SEC }}>Avg Retention</div>
      </Card>
    </div>
  );
}

// Main Dashboard Component
export default function DirectorDashboard() {
  const isMobile = useIsMobile();
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showCopilot, setShowCopilot] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile Layout
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", background: BG }}>
        {/* Mobile Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: WHITE, borderBottom: `1px solid ${BORDER}`,
          padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/" style={{ color: TEXT_SEC, textDecoration: "none" }}>
              <Icon icon="chevronLeft" />
            </Link>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>Director View</div>
              <div style={{ fontSize: 11, color: TEXT_SEC }}>Trainer Performance</div>
            </div>
          </div>
          <button
            onClick={() => setShowCopilot(!showCopilot)}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: showCopilot ? TEAL : BG,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: showCopilot ? WHITE : TEXT
            }}
          >
            <Icon icon="message" size={18} />
          </button>
        </header>

        {/* Mobile Content */}
        <div style={{ padding: 16 }}>
          <MobileSummaryStats trainers={trainersData} />
          
          <ROIMatrix 
            trainers={trainersData} 
            selectedTrainer={selectedTrainer} 
            onSelectTrainer={setSelectedTrainer} 
          />
          
          {selectedTrainer && (
            <div style={{ marginTop: 16 }}>
              <TrainerDetail trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} />
            </div>
          )}
          
          <div style={{ marginTop: 16 }}>
            <RevenueAttribution trainers={trainersData} selectedTrainer={selectedTrainer} />
          </div>
          
          <div style={{ marginTop: 16 }}>
            <RetentionRadar trainers={trainersData} />
          </div>
          
          <div style={{ marginTop: 16 }}>
            <ProgramPL programs={programsData} />
          </div>
          
          <div style={{ marginTop: 16, marginBottom: 80 }}>
            <CapacityUtilization trainers={trainersData} />
          </div>
        </div>

        {/* Mobile Copilot Overlay */}
        {showCopilot && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: WHITE
          }}>
            <div style={{
              height: "100%", display: "flex", flexDirection: "column"
            }}>
              <div style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", gap: 12
              }}>
                <button
                  onClick={() => setShowCopilot(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: TEXT }}
                >
                  <Icon icon="chevronLeft" />
                </button>
                <span style={{ fontWeight: 600, color: TEXT }}>Director Copilot</span>
              </div>
              <div style={{ flex: 1 }}>
                <DirectorCopilot trainers={trainersData} selectedTrainer={selectedTrainer} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: WHITE, borderRight: `1px solid ${BORDER}`,
        padding: 20, display: "flex", flexDirection: "column"
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: TEAL }}>Milton AI</div>
          <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>Director Dashboard</div>
        </div>
        
        <nav style={{ flex: 1 }}>
          <Link 
            to="/"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              color: TEXT_SEC, textDecoration: "none",
              marginBottom: 4
            }}
          >
            <Icon icon="users" size={18} />
            <span style={{ fontSize: 14 }}>Coach View</span>
          </Link>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: TEAL_LIGHT, color: TEAL,
              fontWeight: 600
            }}
          >
            <Icon icon="chart" size={18} />
            <span style={{ fontSize: 14 }}>Director View</span>
          </div>
        </nav>
        
        <div style={{ 
          padding: 12, background: BG, borderRadius: 10,
          fontSize: 12, color: TEXT_SEC, textAlign: "center"
        }}>
          Trainer ROI Analytics
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: TEXT }}>Trainer Performance</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: TEXT_SEC }}>Monitor ROI, outcomes, and capacity across your team</p>
          </div>
          
          <SummaryStats trainers={trainersData} programs={programsData} />
          
          <div style={{ display: "grid", gridTemplateColumns: selectedTrainer ? "1fr 320px" : "1fr", gap: 20, marginTop: 20 }}>
            <div>
              <ROIMatrix 
                trainers={trainersData} 
                selectedTrainer={selectedTrainer} 
                onSelectTrainer={setSelectedTrainer} 
              />
            </div>
            {selectedTrainer && (
              <TrainerDetail trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} />
            )}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <RevenueAttribution trainers={trainersData} selectedTrainer={selectedTrainer} />
            <RetentionRadar trainers={trainersData} />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <ProgramPL programs={programsData} />
            <CapacityUtilization trainers={trainersData} />
          </div>
        </div>
      </main>

      {/* Copilot Panel */}
      <aside style={{
        width: 360, background: WHITE, borderLeft: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column"
      }}>
        <DirectorCopilot trainers={trainersData} selectedTrainer={selectedTrainer} />
      </aside>
    </div>
  );
}
