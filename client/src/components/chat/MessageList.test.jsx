import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from './MessageList';

describe('MessageList', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders an empty state when there are no messages', () => {
    render(
      <MessageList
        messages={[]}
        participants={[]}
        currentUserId="me"
        typingUsers={[]}
      />
    );

    expect(screen.getByText('No messages yet. Say hi!')).toBeInTheDocument();
  });

  it('renders message content and reactions', () => {
    render(
      <MessageList
        messages={[
          {
            id: 'message-1',
            senderId: 'jamie',
            body: 'Let us sync after class.',
            sentAt: '2026-03-15T10:00:00.000Z',
            reactions: [{ emoji: '🔥', count: 1, userIds: ['me'] }],
          },
        ]}
        participants={[
          { id: 'jamie', name: 'Jamie Tan', initials: 'JT', gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)' },
        ]}
        currentUserId="me"
        typingUsers={[]}
      />
    );

    expect(screen.getByText('Let us sync after class.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔥 1/i })).toBeInTheDocument();
  });
});
