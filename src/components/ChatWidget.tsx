
import React, { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Plus,
  CheckCheck,
} from "lucide-react";
import "./ChatWidget.css";

interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  online: boolean;
  unread: number;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "HR Admin",
    role: "Administrator",
    initials: "HA",
    color: "purple",
    online: true,
    unread: 0,
    messages: [
      {
        id: 1,
        text: "Good morning! Welcome to WorkX Team Chat.",
        sender: "other",
        time: "10:30 AM",
      },
      {
        id: 2,
        text: "Thank you! Happy to be here.",
        sender: "me",
        time: "10:32 AM",
      },
      {
        id: 3,
        text: "Please check the latest HR announcements.",
        sender: "other",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: 2,
    name: "Development Team",
    role: "Group conversation",
    initials: "DT",
    color: "blue",
    online: true,
    unread: 2,
    messages: [
      {
        id: 4,
        text: "Hello team! Please share today's project update.",
        sender: "other",
        time: "11:00 AM",
      },
    ],
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "HR Executive",
    initials: "PS",
    color: "pink",
    online: false,
    unread: 0,
    messages: [
      {
        id: 5,
        text: "Can we discuss the employee onboarding process?",
        sender: "other",
        time: "09:45 AM",
      },
    ],
  },
];

const ChatWidget: React.FC = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);

  const [activeConversation, setActiveConversation] = useState(1);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const currentConversation = conversations.find(
    (conversation) => conversation.id === activeConversation
  );

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversation
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    );

    setMessage("");
  };

  return (
    <div className="workx-chat-container">
      <div className="workx-chat-topbar">
        <div>
          <div className="workx-chat-title">
            <h2>Team Chat</h2>
            <span className="chat-live-indicator">Live workspace</span>
          </div>
          <p>Stay connected with your team and colleagues</p>
        </div>

        <button className="chat-new-button" type="button">
          <Plus size={17} />
          New Chat
        </button>
      </div>

      <div className="workx-chat-layout">
        <aside className="workx-chat-sidebar">
          <div className="chat-sidebar-heading">
            <h3>Messages</h3>
            <span>{conversations.length}</span>
          </div>

          <div className="chat-search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="chat-filter-label">ALL CONVERSATIONS</div>

          <div className="chat-contact-list">
            {filteredConversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                className={`workx-chat-contact ${
                  activeConversation === conversation.id ? "selected" : ""
                }`}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <div className={`workx-chat-avatar ${conversation.color}`}>
                  {conversation.initials}
                  {conversation.online && <i />}
                </div>

                <div className="workx-contact-details">
                  <strong>{conversation.name}</strong>
                  <span>{conversation.role}</span>
                </div>

                {conversation.unread > 0 && (
                  <span className="chat-unread-count">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}

            {filteredConversations.length === 0 && (
              <p className="chat-empty-search">No conversations found.</p>
            )}
          </div>
        </aside>

        <section className="workx-chat-main">
          {currentConversation && (
            <>
              <div className="workx-chat-conversation-header">
                <div className={`workx-chat-avatar ${currentConversation.color}`}>
                  {currentConversation.initials}
                  {currentConversation.online && <i />}
                </div>

                <div className="workx-chat-person">
                  <h3>{currentConversation.name}</h3>
                  <span>
                    <i className={currentConversation.online ? "online" : ""} />
                    {currentConversation.online ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="workx-chat-actions">
                  <button type="button" aria-label="Voice call">
                    <Phone size={18} />
                  </button>
                  <button type="button" aria-label="Video call">
                    <Video size={19} />
                  </button>
                  <button type="button" aria-label="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div className="workx-chat-messages">
                <div className="chat-date-divider">
                  <span>Today</span>
                </div>

                {currentConversation.messages.map((item) => (
                  <div
                    key={item.id}
                    className={`workx-message-row ${
                      item.sender === "me" ? "sent" : "received"
                    }`}
                  >
                    <div className="workx-message-content">
                      <div className="workx-message-bubble">
                        {item.text}
                      </div>

                      <div className="workx-message-time">
                        {item.time}
                        {item.sender === "me" && (
                          <CheckCheck size={14} className="chat-message-check" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                className="workx-chat-composer"
                onSubmit={handleSendMessage}
              >
                <button type="button" aria-label="Attach file">
                  <Paperclip size={19} />
                </button>

                <input
                  type="text"
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button type="button" aria-label="Add emoji">
                  <Smile size={19} />
                </button>

                <button
                  type="submit"
                  className="workx-send-button"
                  disabled={!message.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>

              <div className="chat-encryption-note">
                Your team conversations stay within your workspace.
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatWidget;
