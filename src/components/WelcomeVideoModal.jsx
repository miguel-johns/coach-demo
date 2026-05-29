import React, { useState, useRef, useEffect } from "react";

const TEAL = "#2B7A78";
const MINT = "#5CDB95";
const WHITE = "#ffffff";
const TEXT = "#1a2e2a";
const TEXT_SEC = "#5f7a76";
const BORDER = "#e0ebe8";
const OVERLAY = "rgba(0,0,0,0.65)";

export default function WelcomeVideoModal({ onClose }) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const videoRef = useRef(null);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleClose = () => {
    if (!videoEnded) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleDoItMyself = () => {
    onClose();
  };

  const handleGoBack = () => {
    setShowConfirmation(false);
  };

  const handleBookWorkshop = () => {
    // Placeholder for booking workshop action
    console.log("Book Workshop clicked");
    onClose();
  };

  const handleWatchTutorial = () => {
    // Placeholder for watch tutorial action
    console.log("Watch Tutorial clicked");
    onClose();
  };

  // For demo: simulate video ending after 3 seconds if clicked
  const handleVideoClick = () => {
    setVideoEnded(true);
  };

  if (showConfirmation) {
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
          
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: TEXT,
            margin: "0 0 12px",
          }}>
            Are you sure?
          </h2>
          
          <p style={{
            fontSize: 15,
            color: TEXT_SEC,
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}>
            Learning how to use this platform effectively is crucial to maximizing your results and growing your coaching business. Many coaches see a <strong style={{ color: TEXT }}>40% increase in client retention</strong> after completing our training.
          </p>

          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}>
            <p style={{
              fontSize: 14,
              color: "#166534",
              margin: 0,
              fontWeight: 500,
            }}>
              The workshop and tutorial take less than 15 minutes and can help you make more money with every client.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={handleGoBack}
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
              onClick={handleDoItMyself}
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
          onClick={handleVideoClick}
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
                transition: "all 0.3s",
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
              <p style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 16,
                fontWeight: 500,
                margin: 0,
              }}>
                Welcome to Milton AI
              </p>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                margin: "8px 0 0",
              }}>
                Click to simulate video completion
              </p>
            </>
          ) : (
            <>
              {/* Completed state */}
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
              <p style={{
                color: WHITE,
                fontSize: 18,
                fontWeight: 600,
                margin: 0,
              }}>
                Video Complete
              </p>
            </>
          )}
        </div>

        {/* Content section */}
        <div style={{ padding: 24 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: TEXT,
            margin: "0 0 8px",
            textAlign: "center",
          }}>
            {videoEnded ? "Ready to get started?" : "Welcome to Milton AI"}
          </h2>
          
          <p style={{
            fontSize: 14,
            color: TEXT_SEC,
            margin: "0 0 20px",
            textAlign: "center",
            lineHeight: 1.5,
          }}>
            {videoEnded 
              ? "Choose how you'd like to learn the platform and start growing your business."
              : "Watch this quick video to learn how to maximize your coaching business with Milton AI."
            }
          </p>

          {/* Action buttons - only enabled after video ends */}
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
              onMouseOver={(e) => {
                if (videoEnded) {
                  e.currentTarget.style.background = "#e8f5f3";
                }
              }}
              onMouseOut={(e) => {
                if (videoEnded) {
                  e.currentTarget.style.background = WHITE;
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Watch Tutorial
            </button>
          </div>

          {!videoEnded && (
            <p style={{
              fontSize: 12,
              color: TEXT_SEC,
              margin: "16px 0 0",
              textAlign: "center",
            }}>
              Actions will be available after watching the video
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
