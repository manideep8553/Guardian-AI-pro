import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Pencil, Square, Circle, Minus, Type, Eraser,
  Undo2, Redo2, Trash2, Download, ZoomIn, ZoomOut, Users,
  MessageSquare, X, Sliders
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { cn, getInitials } from '../lib/utils';

type Tool = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser';

interface Point { x: number; y: number }

interface DrawElement {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  strokeWidth: number;
  text?: string;
}

const presetColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#0088ff', '#ff4488', '#44ff88', '#884400', '#888888',
];

const mockParticipants = [
  { name: 'Alice Chen', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', isOnline: true },
  { name: 'Bob Smith', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', isOnline: true },
  { name: 'Carol Davis', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', isOnline: false },
  { name: 'Dan Wilson', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dan', isOnline: true },
];

const mockChatMessages = [
  { id: 'm1', name: 'Alice Chen', message: 'Can you explain this diagram?', time: '2:30 PM' },
  { id: 'm2', name: 'Bob Smith', message: 'Sure, it\'s a free body diagram', time: '2:31 PM' },
  { id: 'm3', name: 'Alice Chen', message: 'Thanks, that makes sense now!', time: '2:33 PM' },
];

export function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [history, setHistory] = useState<DrawElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [zoom, setZoom] = useState(1);
  const [canvasSize] = useState({ width: 1200, height: 700 });
  const [startPos, setStartPos] = useState<Point | null>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const saveState = useCallback((newElements: DrawElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setStartPos(point);
    if (tool === 'text') {
      const newElement: DrawElement = {
        id: Date.now().toString(),
        tool: 'text',
        points: [point],
        color,
        strokeWidth,
        text: 'Text',
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      saveState(newElements);
      setIsDrawing(false);
      return;
    }
    setCurrentPoints([point]);
  }, [getCanvasPoint, tool, color, strokeWidth, elements, saveState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const point = getCanvasPoint(e);
    if (tool === 'pencil' || tool === 'eraser') {
      setCurrentPoints(prev => [...prev, point]);
    } else {
      setCurrentPoints([startPos!, point]);
    }
  }, [isDrawing, getCanvasPoint, tool, startPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length < 2 && tool !== 'pencil' && tool !== 'eraser') {
      setCurrentPoints([]);
      return;
    }
    const newElement: DrawElement = {
      id: Date.now().toString(),
      tool: tool === 'eraser' ? 'pencil' : tool,
      points: currentPoints,
      color: tool === 'eraser' ? '#ffffff' : color,
      strokeWidth: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveState(newElements);
    setCurrentPoints([]);
    setStartPos(null);
  }, [isDrawing, currentPoints, tool, color, strokeWidth, elements, saveState]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    const allElements = [...elements];
    if (isDrawing && currentPoints.length > 0) {
      allElements.push({
        id: 'drawing',
        tool: tool === 'eraser' ? 'pencil' : tool,
        points: currentPoints,
        color: tool === 'eraser' ? '#ffffff' : color,
        strokeWidth: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      });
    }

    allElements.forEach(el => {
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = el.color;

      if (el.tool === 'pencil' || el.tool === 'text') {
        if (el.points.length < 2) return;
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
        if (el.text && el.points[0]) {
          ctx.font = '16px Inter, sans-serif';
          ctx.fillText(el.text, el.points[0].x, el.points[0].y);
        }
      } else if (el.tool === 'rectangle' && el.points.length >= 2) {
        const [p1, p2] = [el.points[0], el.points[el.points.length - 1]];
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (el.tool === 'circle' && el.points.length >= 2) {
        const [p1, p2] = [el.points[0], el.points[el.points.length - 1]];
        const radius = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.tool === 'line' && el.points.length >= 2) {
        ctx.moveTo(el.points[0].x, el.points[0].y);
        ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
        ctx.stroke();
      }
    });
  }, [elements, isDrawing, currentPoints, tool, color, strokeWidth, canvasSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const undo = () => {
    if (historyIndex < 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements(newIndex >= 0 ? [...history[newIndex]] : []);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements([...history[newIndex]]);
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const sendChat = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      name: 'You',
      message: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatMessage('');
  };

  const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pencil', icon: Pencil, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Whiteboard</h1>
          <p className="text-muted-foreground mt-1">Visual collaboration canvas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setShowParticipants(!showParticipants)}>
            <Users className="h-4 w-4" /> {mockParticipants.filter(p => p.isOnline).length} online
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="h-4 w-4" /> Chat
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <Card className="overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
              {tools.map(t => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool(t.id)}
                  title={t.label}
                >
                  <t.icon className="h-4 w-4" />
                </Button>
              ))}
              <Separator orientation="vertical" className="h-6 mx-1" />
              <div className="flex items-center gap-1 px-2">
                {presetColors.map(c => (
                  <button
                    key={c}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 transition-all',
                      color === c ? 'border-primary scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
                <Input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="h-6 w-6 p-0 border-0 cursor-pointer"
                />
              </div>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <div className="flex items-center gap-2 px-2">
                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={strokeWidth}
                  onChange={e => setStrokeWidth(Number(e.target.value))}
                  className="w-20 h-1 accent-primary"
                />
                <span className="text-xs text-muted-foreground w-5">{strokeWidth}px</span>
              </div>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={undo} disabled={historyIndex < 0}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={clearCanvas}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={exportAsPNG}>
                <Download className="h-3.5 w-3.5" /> Export PNG
              </Button>
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="relative overflow-auto bg-white/50" style={{ height: 'calc(100vh - 280px)' }}>
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="cursor-crosshair"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: canvasSize.width,
                  height: canvasSize.height,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              {elements.length === 0 && !isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Pencil className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground text-sm">Start drawing on the canvas</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Select a tool and begin creating</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-64 shrink-0 hidden lg:block"
            >
              <Card>
                <CardHeader className="py-3 px-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participants
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowParticipants(false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {mockParticipants.map((p, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={p.image} />
                          <AvatarFallback className="text-xs">{getInitials(p.name)}</AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                          p.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.isOnline ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-72 shrink-0 hidden lg:block"
            >
              <Card className="flex flex-col h-full">
                <CardHeader className="py-3 px-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowChat(false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 flex-1 flex flex-col">
                  <ScrollArea className="flex-1 mb-3">
                    <div className="space-y-3">
                      {chatMessages.map(msg => (
                        <div key={msg.id}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium">{msg.name}</span>
                            <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="h-9 text-sm"
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                    />
                    <Button size="sm" className="h-9" onClick={sendChat}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
