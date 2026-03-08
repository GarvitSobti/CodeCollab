import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const conversations = [
    {
      id: 1,
      name: 'Alex Chen',
      lastMessage: 'Hey! Would love to team up for the hackathon',
      time: '2m ago',
      unread: true,
      avatar: 'AC',
    },
    {
      id: 2,
      name: 'Sarah Tan',
      lastMessage: 'The project looks great so far!',
      time: '1h ago',
      unread: false,
      avatar: 'ST',
    },
    {
      id: 3,
      name: 'Marcus Lim',
      lastMessage: 'Let me know when you are free to call',
      time: '3h ago',
      unread: false,
      avatar: 'ML',
    },
    {
      id: 4,
      name: 'Priya Kumar',
      lastMessage: 'Thanks for the feedback!',
      time: '1d ago',
      unread: false,
      avatar: 'PK',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16 h-screen">
        <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold">Messages</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium shrink-0">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className={`text-sm truncate ${chat.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat View */}
          <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{selectedChat.name}</p>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl rounded-bl-md px-4 py-2 bg-muted">
                        <p className="text-sm">Hey! I saw your profile and I think we would make a great team for the upcoming hackathon!</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[70%] rounded-2xl rounded-br-md px-4 py-2 bg-primary text-primary-foreground">
                        <p className="text-sm">Hi! Thanks for reaching out. What hackathon were you thinking about?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl rounded-bl-md px-4 py-2 bg-muted">
                        <p className="text-sm">{selectedChat.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="input flex-1"
                    />
                    <button className="btn-primary px-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
