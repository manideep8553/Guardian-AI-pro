import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Users, Clock, Calendar, BookOpen,
  Globe, Beaker,
  ChevronRight, Monitor,
  Hash, Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '../components/ui/select';
import { cn, getInitials, formatDate, formatTime, truncate } from '../lib/utils';

const subjects = ['Math', 'CS', 'Physics', 'Chemistry', 'Languages', 'Biology', 'History', 'Literature'];



const participantsList = [
  { name: 'Alice Chen', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { name: 'Bob Smith', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { name: 'Carol Davis', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
  { name: 'Dan Wilson', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dan' },
  { name: 'Eve Martin', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve' },
  { name: 'Frank Lee', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' },
];

const mockRooms = [
  {
    id: '1', title: 'Calculus III Review Session', subject: 'Math',
    description: 'Going over derivatives, integrals, and series for the upcoming final exam.',
    maxCapacity: 8, participantCount: 5, status: 'live' as const,
    participants: participantsList.slice(0, 5), isSaved: false, isMyRoom: true,
    scheduledFor: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    id: '2', title: 'Data Structures & Algorithms', subject: 'CS',
    description: 'Group study on binary trees, graphs, and dynamic programming problems.',
    maxCapacity: 6, participantCount: 3, status: 'live' as const,
    participants: participantsList.slice(2, 5), isSaved: true, isMyRoom: false,
    scheduledFor: new Date(Date.now() + 7200000).toISOString(),
  },
  {
    id: '3', title: 'Organic Chemistry Mechanisms', subject: 'Chemistry',
    description: 'Working through reaction mechanisms and synthesis pathways.',
    maxCapacity: 10, participantCount: 7, status: 'scheduled' as const,
    participants: participantsList.slice(1, 5), isSaved: false, isMyRoom: false,
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: '4', title: 'Quantum Mechanics Study Group', subject: 'Physics',
    description: 'Schrödinger equation, operators, and perturbation theory.',
    maxCapacity: 5, participantCount: 5, status: 'live' as const,
    participants: participantsList.slice(0, 5), isSaved: true, isMyRoom: false,
    scheduledFor: new Date(Date.now() + 10800000).toISOString(),
  },
  {
    id: '5', title: 'Spanish Conversation Practice', subject: 'Languages',
    description: 'Practice conversational Spanish with native speakers.',
    maxCapacity: 6, participantCount: 2, status: 'scheduled' as const,
    participants: participantsList.slice(3, 5), isSaved: false, isMyRoom: false,
    scheduledFor: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    id: '6', title: 'Machine Learning Project', subject: 'CS',
    description: 'Collaborative work on neural network implementation project.',
    maxCapacity: 4, participantCount: 1, status: 'recording' as const,
    participants: participantsList.slice(0, 3), isSaved: false, isMyRoom: true,
    scheduledFor: new Date(Date.now() + 259200000).toISOString(),
  },
  {
    id: '7', title: 'Molecular Biology Lab Prep', subject: 'Biology',
    description: 'Preparing for next week\'s molecular biology lab session.',
    maxCapacity: 8, participantCount: 4, status: 'scheduled' as const,
    participants: participantsList.slice(2, 6), isSaved: false, isMyRoom: false,
    scheduledFor: new Date(Date.now() + 345600000).toISOString(),
  },
  {
    id: '8', title: 'Shakespeare Analysis', subject: 'Literature',
    description: 'Discussing Hamlet and Macbeth themes and literary devices.',
    maxCapacity: 6, participantCount: 0, status: 'scheduled' as const,
    participants: [], isSaved: false, isMyRoom: false,
    scheduledFor: new Date(Date.now() + 432000000).toISOString(),
  },
];

const subjectIcons: Record<string, React.ElementType> = {
  Math: Hash, CS: Monitor, Physics: Globe, Chemistry: Beaker,
  Languages: Globe, Biology: Beaker, History: BookOpen, Literature: BookOpen,
};

const statusColors: Record<string, string> = {
  live: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  scheduled: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  recording: 'bg-red-500/15 text-red-500 border-red-500/30',
};

export function StudyRoomsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [rooms, setRooms] = useState(mockRooms);

  const [formData, setFormData] = useState({
    title: '', description: '', subject: 'Math', maxCapacity: '8', scheduledDate: '',
    scheduledTime: '', isPrivate: false,
  });

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (activeTab === 'my') result = result.filter(r => r.isMyRoom);
    else if (activeTab === 'saved') result = result.filter(r => r.isSaved);
    if (selectedSubjects.length > 0) result = result.filter(r => selectedSubjects.includes(r.subject));
    if (searchQuery) result = result.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return result;
  }, [rooms, activeTab, selectedSubjects, searchQuery]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleCreateRoom = () => {
    const newRoom = {
      id: String(Date.now()),
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      maxCapacity: parseInt(formData.maxCapacity),
      participantCount: 1,
      status: 'scheduled' as const,
      participants: [{ name: 'You', image: '' }],
      isSaved: false,
      isMyRoom: true,
      scheduledFor: formData.scheduledDate
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime || '00:00'}`).toISOString()
        : new Date(Date.now() + 86400000).toISOString(),
    };
    setRooms(prev => [newRoom, ...prev]);
    setShowCreateDialog(false);
    setFormData({ title: '', description: '', subject: 'Math', maxCapacity: '8', scheduledDate: '', scheduledTime: '', isPrivate: false });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Study Rooms</h1>
          <p className="text-muted-foreground mt-1">Collaborate with peers in real-time study sessions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Study Room</DialogTitle>
              <DialogDescription>Set up a new collaborative study session</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Title</label>
                <Input
                  placeholder="e.g., Calculus Final Review"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={formData.subject} onValueChange={v => setFormData(prev => ({ ...prev, subject: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="What will this room focus on?"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Capacity</label>
                  <Select value={formData.maxCapacity} onValueChange={v => setFormData(prev => ({ ...prev, maxCapacity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 10, 15, 20].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} people</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={formData.scheduledDate}
                    onChange={e => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input type="time" value={formData.scheduledTime}
                  onChange={e => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateRoom} disabled={!formData.title}>Create Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search study rooms..."
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="my">My Rooms</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-2 mb-6">
          {subjects.map((subject, i) => (
            <motion.button
              key={subject}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => toggleSubject(subject)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                selectedSubjects.includes(subject)
                  ? 'bg-primary/15 text-primary border-primary/30 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              )}
            >
              {React.createElement(subjectIcons[subject] || Hash, { className: 'h-3.5 w-3.5' })}
              {subject}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {filteredRooms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No rooms found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {searchQuery || selectedSubjects.length > 0
              ? 'Try adjusting your search or filters'
              : activeTab === 'my' ? 'You haven\'t created any rooms yet' : 'No saved rooms yet'}
          </p>
          {(activeTab === 'my' || (!searchQuery && selectedSubjects.length === 0)) && (
            <Button variant="outline" className="mt-4 gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" /> Create your first room
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredRooms.map((room, i) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Card className="group card-hover overflow-hidden relative">
                  <div className={cn(
                    'absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border flex items-center gap-1',
                    statusColors[room.status]
                  )}>
                    {room.status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {room.status}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="gap-1">
                        {React.createElement(subjectIcons[room.subject] || Hash, { className: 'h-3 w-3' })}
                        {room.subject}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">{room.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {truncate(room.description, 100)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex -space-x-2">
                        {room.participants.slice(0, 4).map((p, idx) => (
                          <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                            <AvatarImage src={p.image} />
                            <AvatarFallback className="text-[10px]">{getInitials(p.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {room.participants.length > 4 && (
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-background">
                            +{room.participants.length - 4}
                          </div>
                        )}
                        {room.participants.length === 0 && (
                          <span className="text-xs text-muted-foreground">No participants yet</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.participantCount}/{room.maxCapacity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {room.status === 'scheduled' ? (
                          <><Calendar className="h-3 w-3" /> {formatDate(room.scheduledFor)}</>
                        ) : room.status === 'live' ? (
                          <><Clock className="h-3 w-3" /> Started {formatTime(room.scheduledFor)}</>
                        ) : (
                          <><Video className="h-3 w-3" /> Recording available</>
                        )}
                      </span>
                      <Button size="sm" className={cn(
                        'h-8 gap-1 text-xs',
                        room.status === 'live' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                      )}>
                        {room.status === 'live' ? 'Join Now' : room.status === 'scheduled' ? 'Remind Me' : 'Watch'}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
