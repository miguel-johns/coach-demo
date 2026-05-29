import React, { useState } from "react";

const TEAL = "#2B7A78";
const MINT = "#5CDB95";
const WHITE = "#ffffff";
const TEXT = "#1a2e2a";
const TEXT_SEC = "#5f7a76";
const BORDER = "#e0ebe8";
const OVERLAY = "rgba(0,0,0,0.65)";

// Screens: "intro" | "confirmation" | "booking" | "tutorial" | "congratulations"
export default function WelcomeVideoModal({ onClose }) {
  const [screen, setScreen] = useState("intro");
  const [videoEnded, setVideoEnded] = useState(false);
  const [workshopBooked, setWorkshopBooked] = useState(false);
  const [tutorialWatched, setTutorialWatched] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleClose = () => {
    if (!videoEnded) {
      setScreen("confirmation");
    } else {
      onClose();
    }
  };

  const handleBookWorkshop = () => {
    setScreen("booking");
  };

  const handleWatchTutorial = () => {
    setScreen("tutorial");
  };

  const handleBookingComplete = () => {
    setWorkshopBooked(true);
    if (tutorialWatched) {
      setScreen("congratulations");
    } else {
      setScreen("tutorial");
    }
  };

  const handleTutorialComplete = () => {
    setTutorialWatched(true);
    if (workshopBooked) {
      setScreen("congratulations");
    } else {
      setScreen("booking");
    }
  };

  const handleFinish = () => {
    onClose();
  };

  // Generate calendar dates for the next 2 weeks
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates.slice(0, 10);
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  // ═══════════════════════════════════════════════════════════════
  // CONFIRMATION SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (screen === "confirmation") {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: OVERLAY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}>
        <div style={{
          background: WHITE,
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          padding: 32,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>
            Are you sure?
          </h2>
          
          <p style={{ fontSize: 15, color: TEXT_SEC, lineHeight: 1.6, margin: "0 0 24px" }}>
            Learning how to use this platform effectively is crucial to maximizing your results and growing your coaching business. Many coaches see a <strong style={{ color: TEXT }}>40% increase in client retention</strong> after completing our training.
          </p>

          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 14, color: "#166534", margin: 0, fontWeight: 500 }}>
              The workshop and tutorial take less than 15 minutes and can help you make more money with every client.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setScreen("intro")}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: 10,
                border: "none",
                background: TEAL,
                color: WHITE,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#236563"}
              onMouseOut={(e) => e.currentTarget.style.background = TEAL}
            >
              Go Back to Video
            </button>
            
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                background: WHITE,
                color: TEXT_SEC,
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#f7faf9";
                e.currentTarget.style.borderColor = "#ccdad7";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = WHITE;
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              Do it myself
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BOOKING SCREEN (Calendly-style) - Mobile Responsive
  // ═══════════════════════════════════════════════════════════════
  if (screen === "booking") {
    const dates = generateDates();
    const isMobileView = typeof window !== "undefined" && window.innerWidth < 600;
    
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: OVERLAY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 12,
        overflow: "auto",
      }}>
        <div style={{
          background: WHITE,
          borderRadius: 16,
          width: "100%",
          maxWidth: 720,
          maxHeight: "95vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header section - always visible on mobile */}
          <div style={{
            background: "#f8faf9",
            borderBottom: `1px solid ${BORDER}`,
            padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: TEAL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>
                  Milton AI Workshop
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span style={{ fontSize: 12, color: TEXT_SEC }}>30 min</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 10l5 5-5 5"/>
                      <path d="M4 4v7a4 4 0 004 4h12"/>
                    </svg>
                    <span style={{ fontSize: 12, color: TEXT_SEC }}>Video call</span>
                  </div>
                </div>
              </div>
              {tutorialWatched && (
                <div style={{
                  padding: "6px 10px",
                  background: "#f0fdf4",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span style={{ fontSize: 11, color: "#166534", fontWeight: 500 }}>Tutorial done</span>
                </div>
              )}
            </div>
          </div>

          {/* Calendar content */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Date selection */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: "0 0 12px" }}>
                Select a Date
              </h4>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 6,
              }}>
                {dates.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    style={{
                      padding: "10px 4px",
                      borderRadius: 8,
                      border: selectedDate?.getTime() === date.getTime() ? `2px solid ${TEAL}` : `1px solid ${BORDER}`,
                      background: selectedDate?.getTime() === date.getTime() ? "#e8f5f3" : WHITE,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 10, color: TEXT_SEC, marginBottom: 2 }}>
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
                      {date.getDate()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time selection */}
            {selectedDate && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: "0 0 12px" }}>
                  Select a Time
                </h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}>
                  {timeSlots.map((time, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: 8,
                        border: selectedTime === time ? `2px solid ${TEAL}` : `1px solid ${BORDER}`,
                        background: selectedTime === time ? "#e8f5f3" : WHITE,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        color: selectedTime === time ? TEAL : TEXT,
                        transition: "all 0.15s",
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleBookingComplete}
              disabled={!selectedDate || !selectedTime}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 10,
                border: "none",
                background: (!selectedDate || !selectedTime) ? "#ccc" : TEAL,
                color: WHITE,
                fontSize: 14,
                fontWeight: 600,
                cursor: (!selectedDate || !selectedTime) ? "default" : "pointer",
                transition: "all 0.2s",
                marginTop: 4,
              }}
              onMouseOver={(e) => (selectedDate && selectedTime) && (e.currentTarget.style.background = "#236563")}
              onMouseOut={(e) => (selectedDate && selectedTime) && (e.currentTarget.style.background = TEAL)}
            >
              {selectedDate && selectedTime 
                ? `Confirm ${formatDate(selectedDate)} at ${selectedTime}`
                : "Select date & time"
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TUTORIAL SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (screen === "tutorial") {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: OVERLAY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}>
        <div style={{
          background: WHITE,
          borderRadius: 16,
          width: "100%",
          maxWidth: 800,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}>
          {/* Video area */}
          <div 
            onClick={handleTutorialComplete}
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background: "linear-gradient(135deg, #1a2e2a 0%, #2B7A78 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {/* Play button */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={TEAL} stroke="none">
                  <polygon points="8,5 19,12 8,19"/>
                </svg>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, fontWeight: 600, margin: 0 }}>
              Platform Tutorial
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "8px 0 0" }}>
              Click to simulate tutorial completion
            </p>

            {/* Progress indicator */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "rgba(255,255,255,0.2)",
            }}>
              <div style={{
                width: "0%",
                height: "100%",
                background: MINT,
              }}/>
            </div>
          </div>

          {/* Content section */}
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: "0 0 4px" }}>
                  Getting Started with Milton AI
                </h2>
                <p style={{ fontSize: 14, color: TEXT_SEC, margin: 0 }}>
                  Learn the essentials in under 10 minutes
                </p>
              </div>
              {workshopBooked && (
                <div style={{
                  padding: "8px 12px",
                  background: "#f0fdf4",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span style={{ fontSize: 12, color: "#166534", fontWeight: 500 }}>Workshop booked</span>
                </div>
              )}
            </div>

            {/* Chapter list */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "#f8faf9",
              borderRadius: 12,
              padding: 16,
            }}>
              {[
                { title: "Dashboard Overview", duration: "2:30" },
                { title: "Setting Up Client Profiles", duration: "3:15" },
                { title: "Creating Workout Programs", duration: "2:45" },
                { title: "Tracking Progress & Analytics", duration: "1:30" },
              ].map((chapter, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: WHITE,
                  borderRadius: 8,
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: TEAL,
                    color: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, color: TEXT, fontWeight: 500 }}>
                    {chapter.title}
                  </span>
                  <span style={{ fontSize: 12, color: TEXT_SEC }}>
                    {chapter.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // CONGRATULATIONS SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (screen === "congratulations") {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: OVERLAY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}>
        <div style={{
          background: WHITE,
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}>
          {/* Header with gradient */}
          <div style={{
            background: `linear-gradient(135deg, ${TEAL} 0%, ${MINT} 100%)`,
            padding: "40px 32px",
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: WHITE, margin: "0 0 8px" }}>
              Congratulations!
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", margin: 0 }}>
              You just made an incredible investment in yourself
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: 32 }}>
            <p style={{
              fontSize: 15,
              color: TEXT_SEC,
              lineHeight: 1.7,
              margin: "0 0 24px",
            }}>
              By taking the time to learn Milton AI properly, you&apos;re setting yourself up for success. Coaches who complete onboarding see an average <strong style={{ color: TEXT }}>3x increase in client engagement</strong> within the first month.
            </p>

            {/* Completed items */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 28,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "#f0fdf4",
                borderRadius: 10,
                border: "1px solid #bbf7d0",
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>Workshop Booked</div>
                  <div style={{ fontSize: 12, color: "#15803d" }}>Personalized guidance scheduled</div>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "#f0fdf4",
                borderRadius: 10,
                border: "1px solid #bbf7d0",
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>Tutorial Completed</div>
                  <div style={{ fontSize: 12, color: "#15803d" }}>Platform essentials mastered</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: 10,
                border: "none",
                background: TEAL,
                color: WHITE,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#236563"}
              onMouseOut={(e) => e.currentTarget.style.background = TEAL}
            >
              Start Growing Your Business
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // INTRO SCREEN (Welcome Video)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: OVERLAY,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 20,
    }}>
      <div style={{
        background: WHITE,
        borderRadius: 16,
        width: "100%",
        maxWidth: 640,
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        position: "relative",
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.5)",
            color: WHITE,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
          onMouseOut={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Video placeholder */}
        <div 
          onClick={() => setVideoEnded(true)}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "linear-gradient(135deg, #1a2e2a 0%, #2B7A78 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {!videoEnded ? (
            <>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: WHITE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={TEAL} stroke="none">
                    <polygon points="8,5 19,12 8,19"/>
                  </svg>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: 500, margin: 0 }}>
                Welcome to Milton AI
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "8px 0 0" }}>
                Click to simulate video completion
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: MINT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <p style={{ color: WHITE, fontSize: 18, fontWeight: 600, margin: 0 }}>
                Video Complete
              </p>
            </>
          )}
        </div>

        {/* Content section */}
        <div style={{ padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: "0 0 8px", textAlign: "center" }}>
            {videoEnded ? "Ready to get started?" : "Welcome to Milton AI"}
          </h2>
          
          <p style={{ fontSize: 14, color: TEXT_SEC, margin: "0 0 20px", textAlign: "center", lineHeight: 1.5 }}>
            {videoEnded 
              ? "Choose how you'd like to learn the platform and start growing your business."
              : "Watch this quick video to learn how to maximize your coaching business with Milton AI."
            }
          </p>

          <div style={{
            display: "flex",
            gap: 12,
            opacity: videoEnded ? 1 : 0.4,
            pointerEvents: videoEnded ? "auto" : "none",
            transition: "opacity 0.3s",
          }}>
            <button
              onClick={handleBookWorkshop}
              disabled={!videoEnded}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: 10,
                border: "none",
                background: TEAL,
                color: WHITE,
                fontSize: 15,
                fontWeight: 600,
                cursor: videoEnded ? "pointer" : "default",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseOver={(e) => videoEnded && (e.currentTarget.style.background = "#236563")}
              onMouseOut={(e) => videoEnded && (e.currentTarget.style.background = TEAL)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Book Workshop
            </button>
            
            <button
              onClick={handleWatchTutorial}
              disabled={!videoEnded}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: 10,
                border: `2px solid ${TEAL}`,
                background: WHITE,
                color: TEAL,
                fontSize: 15,
                fontWeight: 600,
                cursor: videoEnded ? "pointer" : "default",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseOver={(e) => videoEnded && (e.currentTarget.style.background = "#e8f5f3")}
              onMouseOut={(e) => videoEnded && (e.currentTarget.style.background = WHITE)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Watch Tutorial
            </button>
          </div>

          {!videoEnded && (
            <p style={{ fontSize: 12, color: TEXT_SEC, margin: "16px 0 0", textAlign: "center" }}>
              Actions will be available after watching the video
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
