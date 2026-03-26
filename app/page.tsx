"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { HeaderCard } from "@/components/client-detail/header-card";
import { UpcomingSessions } from "@/components/client-detail/upcoming-sessions";
import { ActivityHeatmap } from "@/components/client-detail/activity-heatmap";
import { ProfileBaselines } from "@/components/client-detail/profile-baselines";
import { DailyBreakdown } from "@/components/client-detail/daily-breakdown";
import { ChatSidebar } from "@/components/client-detail/chat-sidebar";
import {
  mockClient,
  mockSessions,
  mockActivityData,
  mockProfile,
  mockDailyMetrics,
} from "@/lib/mock-data";

export default function ClientDetailPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>();

  const handleOpenChat = (prompt?: string) => {
    setChatPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatPrompt(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Clients</span>
          </button>
          <button
            onClick={() => handleOpenChat()}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header Card */}
        <HeaderCard client={mockClient} onOpenChat={handleOpenChat} />

        {/* Upcoming Sessions */}
        <UpcomingSessions sessions={mockSessions} />

        {/* Activity Heatmap */}
        <ActivityHeatmap data={mockActivityData} />

        {/* Profile & Baselines */}
        <ProfileBaselines profile={mockProfile} />

        {/* Daily Breakdown */}
        <DailyBreakdown metrics={mockDailyMetrics} />
      </main>

      {/* Floating Chat Button (Desktop) */}
      <button
        onClick={() => handleOpenChat()}
        className="hidden lg:flex fixed bottom-6 right-6 items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-medium">Chat with Milton</span>
      </button>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        initialPrompt={chatPrompt}
        clientName={mockClient.name}
      />
    </div>
  );
}
