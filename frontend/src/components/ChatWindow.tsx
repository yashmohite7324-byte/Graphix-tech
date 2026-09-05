import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Send, Loader2, MessageSquare } from 'lucide-react';

// Install these: npm install @stomp/stompjs sockjs-client
// This component connects to the backend WebSocket at ws://localhost:8081/ws

interface ChatMessage {
  conversationId: number;
  senderId: number;
  senderEmail: string;
  content: string;
  sentAt?: string;
}

interface Props {
  conversationId: number;
  currentUserEmail: string;
  currentUserId: number;
  otherUserName: string;
}

export default function ChatWindow({
  conversationId, currentUserEmail, currentUserId, otherUserName
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load message history
  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['chat-history', conversationId],
    queryFn: () => api.get(`/chat/conversations/${conversationId}/messages`),
  });

  useEffect(() => {
    if (historyRes?.data?.data) {
      setMessages(historyRes.data.data.map((m: any) => ({
        conversationId: m.conversation?.id,
        senderId: m.senderId,
        senderEmail: m.senderEmail,
        content: m.content,
        sentAt: m.createdAt,
      })));
    }
  }, [historyRes]);

  // Connect to WebSocket
  useEffect(() => {
    let client: any = null;

    const connect = async () => {
      try {
        // Dynamic import so the app doesn't crash if library not installed
        const { Client } = await import('@stomp/stompjs');
        const SockJS = (await import('sockjs-client')).default;

        client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
          onConnect: () => {
            setConnected(true);
            // Subscribe to this conversation's topic
            client.subscribe(`/topic/chat/${conversationId}`, (frame: any) => {
              const msg: ChatMessage = JSON.parse(frame.body);
              setMessages(prev => [...prev, msg]);
            });
          },
          onDisconnect: () => setConnected(false),
          reconnectDelay: 5000,
        });

        client.activate();
        setStompClient(client);
      } catch (err) {
        console.warn('WebSocket not available:', err);
      }
    };

    connect();
    return () => { client?.deactivate(); };
  }, [conversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const payload: ChatMessage = {
      conversationId,
      senderId: currentUserId,
      senderEmail: currentUserEmail,
      content: input.trim(),
    };

    if (stompClient?.connected) {
      // Send via WebSocket (real-time)
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload),
      });
    } else {
      // Fallback: send via REST if WebSocket not connected
      api.post('/chat/conversations', payload).catch(console.error);
      // Optimistic update
      setMessages(prev => [...prev, { ...payload, sentAt: new Date().toISOString() }]);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
            {otherUserName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{otherUserName}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-300'}`} />
              {connected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
              <MessageSquare size={22} />
            </div>
            <p className="text-sm font-medium text-slate-700">Start the conversation</p>
            <p className="text-xs text-slate-400 mt-1">
              Messages are delivered in real-time
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.senderEmail === currentUserEmail;
          return (
            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                isMine
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}>
                {!isMine && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderEmail}</p>
                )}
                <p className="leading-relaxed">{msg.content}</p>
                {msg.sentAt && (
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            className="flex-1 input resize-none py-2.5 max-h-32"
            placeholder="Type a message... (Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-50"
          >
            <Send size={17} />
          </button>
        </div>
        {!connected && (
          <p className="text-xs text-amber-500 mt-1">
            ⚠ WebSocket disconnected — messages will still send via REST
          </p>
        )}
      </div>
    </div>
  );
}
