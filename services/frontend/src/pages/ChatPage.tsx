import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Send, ChevronLeft, Phone, Video,
  MoreHorizontal, Check, CheckCheck, MessageSquare,
  Paperclip
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn, getInitials, timeAgo } from '../lib/utils';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  image: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isTyping: boolean;
  messages: ChatMessage[];
}

function generateMessages(convId: string, _name: string): ChatMessage[] {
  const now = Date.now();
  const msgTexts: Record<string, string[]> = {
    c1: ['Gas sensor alert in Zone C', 'Acknowledged, sending a team now', 'Reading shows elevated CO levels', 'Evacuate the area immediately', 'Zone C evacuated, team is investigating'],
    c2: ['Maintenance scheduled for Line 3', 'What time is the shutdown?', '14:00 hours,预计需要2小时', 'I will notify the shift supervisor', 'Line 3 maintenance prep complete'],
    c3: ['Safety briefing at 08:00 tomorrow', 'Roger that, all crew will attend', 'New HAZMAT protocols to cover', 'I will prepare the materials', 'Briefing room will be ready'],
    c4: ['Emergency drill results are in', 'How did Zone A perform?', 'Evacuation time was 4:30 - within target', 'Good, share the full report', 'Will distribute by end of shift'],
    c5: ['Control Room copy, fire alarm test at noon', 'Copy that, testing all zones', 'Verified comms with all fire wardens', 'Systems are go for test', 'Acknowledged, standing by'],
  };
  const texts = msgTexts[convId] || msgTexts.c1;
  return texts.map((text, i) => ({
    id: `${convId}-msg-${i}`,
    senderId: i % 2 === 0 ? 'other' : 'me',
    text,
    time: new Date(now - (texts.length - i) * 60000).toISOString(),
    status: i === texts.length - 1 ? 'read' : 'delivered',
  }));
}

const mockConversations: Conversation[] = [
  { id: 'c1', name: 'Control Room', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Control', isOnline: true, lastMessage: 'Zone C evacuated, team is investigating', lastMessageTime: new Date(Date.now() - 300000).toISOString(), unread: 2, isTyping: false, messages: [] },
  { id: 'c2', name: 'Safety Team Alpha', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha', isOnline: true, lastMessage: 'Line 3 maintenance prep complete', lastMessageTime: new Date(Date.now() - 1800000).toISOString(), unread: 0, isTyping: true, messages: [] },
  { id: 'c3', name: 'Maintenance Crew', image: '', isOnline: false, lastMessage: 'Briefing room will be ready', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unread: 5, isTyping: false, messages: [] },
  { id: 'c4', name: 'Zone A Operators', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZoneA', isOnline: false, lastMessage: 'Will distribute by end of shift', lastMessageTime: new Date(Date.now() - 7200000).toISOString(), unread: 0, isTyping: false, messages: [] },
  { id: 'c5', name: 'Emergency Response', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emergency', isOnline: true, lastMessage: 'Acknowledged, standing by', lastMessageTime: new Date(Date.now() - 14400000).toISOString(), unread: 1, isTyping: false, messages: [] },
  { id: 'c6', name: 'Eve Martin - Safety Officer', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve', isOnline: false, lastMessage: 'Inspection reports ready for review', lastMessageTime: new Date(Date.now() - 28800000).toISOString(), unread: 0, isTyping: false, messages: [] },
];

mockConversations.forEach(conv => {
  conv.messages = generateMessages(conv.id, conv.name);
});

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConvId) || null;

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConvId) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageText,
      time: new Date().toISOString(),
      status: 'sent',
    };
    setConversations(prev => prev.map(c => {
      if (c.id !== activeConvId) return c;
      return {
        ...c,
        lastMessage: messageText,
        lastMessageTime: new Date().toISOString(),
        unread: 0,
        messages: [...c.messages, newMsg],
      };
    }));
    setMessageText('');
  };

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setShowMobileList(false);
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unread: 0 } : c
    ));
  };

  return (
    <div className="h-[calc(100vh-6rem)] -mx-4 sm:mx-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden sm:block px-4 sm:px-0 pb-4"
      >
        <h1 className="text-3xl font-bold gradient-text">Messages</h1>
        <p className="text-muted-foreground mt-1">Chat with safety teams and operators</p>
      </motion.div>

      <div className="flex h-full gap-0 sm:gap-4">
        <div className={cn(
          'w-full sm:w-80 shrink-0',
          !showMobileList && 'hidden sm:block'
        )}>
          <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Conversations</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-3',
                      activeConvId === conv.id ? 'bg-muted/80' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.image} />
                        <AvatarFallback className={cn(
                          'text-xs',
                          conv.id === 'c3' && 'bg-blue-500/20 text-blue-500'
                        )}>
                          {conv.id === 'c3' ? 'MC' : getInitials(conv.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
                        conv.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium truncate">{conv.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {timeAgo(conv.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground truncate">{conv.lastMessage}</span>
                        {conv.unread > 0 && (
                          <span className="h-4 min-w-[16px] px-1 bg-primary text-primary-foreground rounded-full text-[9px] font-medium flex items-center justify-center shrink-0 ml-2">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className={cn(
          'flex-1 min-w-0',
          showMobileList && 'hidden sm:block'
        )}>
          {activeConversation ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="py-2.5 px-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 sm:hidden"
                    onClick={() => setShowMobileList(true)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activeConversation.image} />
                    <AvatarFallback className="text-xs">{getInitials(activeConversation.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activeConversation.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {activeConversation.isTyping ? (
                        <span className="text-emerald-500">typing...</span>
                      ) : activeConversation.isOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Online
                        </span>
                      ) : 'Offline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {activeConversation.messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                          msg.senderId === 'me'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        )}>
                          <p>{msg.text}</p>
                          <div className={cn(
                            'flex items-center gap-1 mt-1',
                            msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                          )}>
                            <span className="text-[10px] opacity-70">
                              {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.senderId === 'me' && (
                              msg.status === 'read' ? (
                                <CheckCheck className="h-3 w-3 text-blue-300" />
                              ) : (
                                <Check className="h-3 w-3 opacity-70" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {activeConversation.isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={activeConversation.image} />
                        <AvatarFallback className="text-[9px]">{getInitials(activeConversation.name)}</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-border shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="min-h-[44px] max-h-[120px] pr-10 resize-none text-sm"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 bottom-1 h-8 w-8 p-0"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="h-[44px] w-[44px] p-0 shrink-0"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
