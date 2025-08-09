"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";

type Message = {
  id?: string;
  text?: string;
  type: "text";
  created_at: string;
  from?: "me" | "ai";
};

export default function ChatPage() {
  const [text, setText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load initial messages from database (no auto-refresh)
  const listQuery = trpc.chat.list.useQuery(undefined, { 
    staleTime: Infinity, // Never refetch automatically
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    // Remove automatic refetch to prevent duplicates
    onSuccess: () => {
      // Only refetch once after sending to get the latest messages
      setTimeout(() => {
        listQuery.refetch();
      }, 1000);
    },
  });

  const clearChat = trpc.chat.clearChat.useMutation({
    onSuccess: () => {
      setLocalMessages([]);
      listQuery.refetch();
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [listQuery.data, localMessages]);

  const handleSend = async () => {
    if (!text.trim() || isTyping) return;
    
    const userMessage = text.trim();
    setText("");
    setIsTyping(true);
    
    // Add user message immediately to the end
    const createdAt = new Date().toISOString();
    setLocalMessages((prev) => [
      ...prev,
      { text: userMessage, type: "text", created_at: createdAt, from: "me" },
    ]);

    try {
      const res = await sendMessage.mutateAsync({ text: userMessage });
      if (res?.reply) {
        setLocalMessages((prev) => [
          ...prev,
          { text: res.reply, type: "text", created_at: new Date().toISOString(), from: "ai" },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setLocalMessages((prev) => [
        ...prev,
        { text: "Sorry, I'm having trouble responding right now.", type: "text", created_at: new Date().toISOString(), from: "ai" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestartChat = async () => {
    try {
      await clearChat.mutateAsync();
    } catch (error) {
      console.error("Failed to clear chat:", error);
      // Fallback: clear local messages even if database clear fails
      setLocalMessages([]);
      listQuery.refetch();
    }
  };

  // Combine database messages with local messages and sort by creation time (oldest first)
  const allMessages = [...(listQuery.data ?? []), ...localMessages]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🤖</span>
            <div className="logo-text">
              <h1>AI Chat</h1>
              <p>Powered by Gemini</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="status-indicator">
              <span className={`status-dot ${listQuery.isLoading ? 'loading' : 'online'}`}></span>
              <span className="status-text">
                {listQuery.isLoading ? 'Connecting...' : 'Online'}
              </span>
            </div>
            <button 
              className="restart-button"
              onClick={handleRestartChat}
              title="Start a new conversation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {allMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Ask me anything! I'm here to help.</p>
          </div>
        ) : (
          <div className="messages-list">
            {allMessages.map((m) => {
              const message = m as Message;
              return (
                <div key={(message.id ?? "") + (message.created_at ?? "") + (message.text ?? "")}
                     className={`message-wrapper ${message.from === "me" ? "user" : "ai"}`}>
                  <div className="message-bubble">
                    <div className="message-content">{message.text}</div>
                    <div className="message-time">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="message-wrapper ai">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            className="message-input"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button
            className={`send-button ${text.trim() && !isTyping ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!text.trim() || isTyping}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
