import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Calendar, Tag,
  Trash2, List, Columns3, CheckCircle2,
  Circle, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '../components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '../components/ui/select';

import { cn, formatDate } from '../lib/utils';

type Priority = 'low' | 'medium' | 'high';
type Column = 'todo' | 'in_progress' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  category: string;
  tags: string[];
  column: Column;
  createdAt: string;
}

const categories = ['Study', 'Assignment', 'Project', 'Exam Prep', 'Reading', 'Research', 'Practice'];

const initialTasks: Task[] = [
  { id: 't1', title: 'Complete Calculus problem set', description: 'Finish problems 1-20 from Chapter 7 on integration techniques', priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString(), category: 'Assignment', tags: ['calculus', 'math'], column: 'todo', createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 't2', title: 'Review Data Structures notes', description: 'Go over binary trees, hash tables, and graph algorithms', priority: 'medium', dueDate: new Date(Date.now() + 172800000).toISOString(), category: 'Study', tags: ['cs', 'dsa'], column: 'todo', createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 't3', title: 'Write lab report for Chemistry', description: 'Document the organic synthesis experiment results and analysis', priority: 'high', dueDate: new Date(Date.now() + 259200000).toISOString(), category: 'Assignment', tags: ['chemistry', 'lab'], column: 'in_progress', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 't4', title: 'Prepare for Physics quiz', description: 'Review electromagnetism chapters and practice problems', priority: 'medium', dueDate: new Date(Date.now() + 43200000).toISOString(), category: 'Exam Prep', tags: ['physics'], column: 'in_progress', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 't5', title: 'Read Chapter 5 of Biology textbook', description: 'Cell division and genetics - take notes on key concepts', priority: 'low', dueDate: new Date(Date.now() + 345600000).toISOString(), category: 'Reading', tags: ['biology', 'reading'], column: 'todo', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 't6', title: 'Practice Spanish vocabulary', description: 'Complete 50 new flashcards on language learning app', priority: 'low', dueDate: new Date(Date.now() + 43200000).toISOString(), category: 'Practice', tags: ['spanish', 'languages'], column: 'completed', createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 't7', title: 'Build React project component', description: 'Implement the dashboard grid layout with responsive design', priority: 'high', dueDate: new Date(Date.now() + 518400000).toISOString(), category: 'Project', tags: ['react', 'frontend'], column: 'in_progress', createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: 't8', title: 'Research paper outline', description: 'Create outline for term paper on machine learning ethics', priority: 'medium', dueDate: new Date(Date.now() + 604800000).toISOString(), category: 'Research', tags: ['research', 'ml'], column: 'todo', createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 't9', title: 'Complete Python coding challenge', description: 'Solve 5 medium-level problems on dynamic programming', priority: 'medium', dueDate: new Date(Date.now() + 21600000).toISOString(), category: 'Practice', tags: ['python', 'algorithms'], column: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 't10', title: 'Review Linear Algebra proofs', description: 'Study vector space properties and linear transformation proofs', priority: 'medium', dueDate: new Date(Date.now() + 432000000).toISOString(), category: 'Study', tags: ['math', 'linear-algebra'], column: 'completed', createdAt: new Date(Date.now() - 1209600000).toISOString() },
  { id: 't11', title: 'Prepare presentation slides', description: 'Create slides for group project on climate change modeling', priority: 'high', dueDate: new Date(Date.now() + 691200000).toISOString(), category: 'Project', tags: ['presentation', 'climate'], column: 'todo', createdAt: new Date(Date.now() - 518400000).toISOString() },
  { id: 't12', title: 'Submit scholarship application', description: 'Complete and submit the Gates Millennium Scholarship application', priority: 'high', dueDate: new Date(Date.now() - 86400000).toISOString(), category: 'Assignment', tags: ['scholarship', 'application'], column: 'completed', createdAt: new Date(Date.now() - 1209600000).toISOString() },
];

const priorityConfig: Record<Priority, { icon: React.ElementType; color: string; label: string }> = {
  low: { icon: ArrowDown, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', label: 'Low' },
  medium: { icon: AlertCircle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', label: 'Medium' },
  high: { icon: ArrowUp, color: 'text-red-500 bg-red-500/10 border-red-500/30', label: 'High' },
};

const columnConfig: { id: Column; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-t-blue-500' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-amber-500' },
  { id: 'completed', label: 'Completed', color: 'border-t-emerald-500' },
];

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium' as Priority,
    dueDate: '', category: 'Study', tags: '',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterCategory]);

  const columns = useMemo(() => ({
    todo: filteredTasks.filter(t => t.column === 'todo'),
    in_progress: filteredTasks.filter(t => t.column === 'in_progress'),
    completed: filteredTasks.filter(t => t.column === 'completed'),
  }), [filteredTasks]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.column === 'completed').length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const moveTask = (taskId: string, toColumn: Column) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: toColumn } : t));
  };

  const toggleTaskColumn = (taskId: string, currentColumn: Column) => {
    const next: Record<Column, Column> = {
      todo: 'in_progress',
      in_progress: 'completed',
      completed: 'todo',
    };
    moveTask(taskId, next[currentColumn]);
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate || new Date(Date.now() + 86400000).toISOString(),
      category: newTask.category,
      tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean),
      column: 'todo',
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    setShowAddDialog(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', category: 'Study', tags: '' });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your study tasks and assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setViewMode('kanban')}>
              <Columns3 className="h-3.5 w-3.5" /> Board
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setViewMode('list')}>
              <List className="h-3.5 w-3.5" /> List
            </Button>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 bg-gradient-to-r from-primary to-blue-500">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
                <DialogDescription>Create a new task for your study plan</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={newTask.title} onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="Task title" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={newTask.description} onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))} placeholder="Add details..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newTask.priority} onValueChange={v => setNewTask(prev => ({ ...prev, priority: v as Priority }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newTask.category} onValueChange={v => setNewTask(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <Input value={newTask.tags} onChange={e => setNewTask(prev => ({ ...prev, tags: e.target.value }))} placeholder="comma, separated" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={addTask} disabled={!newTask.title}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">{completedCount}/{totalCount} tasks completed</span>
                <span className="text-xs text-muted-foreground">({progressPct}%)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {totalCount - completedCount} remaining
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]"><Tag className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {viewMode === 'kanban' ? (
        <div className="grid gap-4 md:grid-cols-3">
          {columnConfig.map((col, colIdx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + colIdx * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2.5 w-2.5 rounded-full', {
                    'bg-blue-500': col.id === 'todo',
                    'bg-amber-500': col.id === 'in_progress',
                    'bg-emerald-500': col.id === 'completed',
                  })} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {columns[col.id].length}
                  </span>
                </div>
              </div>
              <div
                className="space-y-2 min-h-[200px]"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (dragTaskId) moveTask(dragTaskId, col.id);
                  setDragTaskId(null);
                }}
              >
                <AnimatePresence>
                  {columns[col.id].length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-border rounded-lg"
                    >
                      <Circle className="h-6 w-6 text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </motion.div>
                  ) : (
                    columns[col.id].map((task, i) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03 }}
                        draggable
                        onDragStart={() => setDragTaskId(task.id)}
                        onDragEnd={() => setDragTaskId(null)}
                        className={cn(
                          'bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md card-hover',
                          dragTaskId === task.id && 'opacity-50 shadow-lg'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <button onClick={() => toggleTaskColumn(task.id, task.column)} className="mt-0.5 shrink-0">
                              {task.column === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>
                            <span className={cn('text-sm font-medium', task.column === 'completed' && 'line-through text-muted-foreground')}>
                              {task.title}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {React.createElement(priorityConfig[task.priority].icon, {
                            className: cn('h-3 w-3', priorityConfig[task.priority].color.split(' ')[0])
                          })}
                          <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', priorityConfig[task.priority].color)}>
                            {priorityConfig[task.priority].label}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{task.category}</Badge>
                          {task.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.dueDate)}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <List className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No tasks match your filters</p>
                </div>
              ) : (
                filteredTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                  >
                    <button onClick={() => toggleTaskColumn(task.id, task.column)}>
                      {task.column === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', task.column === 'completed' && 'line-through text-muted-foreground')}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConfig[task.priority].color)}>
                          {priorityConfig[task.priority].label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{task.category}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </Card>
      )}
    </div>
  );
}
