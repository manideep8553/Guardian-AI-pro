import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Link2, Code2, BookOpen,
  Download, Search, Filter, File as FileIcon,
  Image as ImageIcon, X, ArrowUpFromLine
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '../components/ui/select';
import { cn, getInitials, formatDate, truncate } from '../lib/utils';

const resourceTypes = ['all', 'notes', 'pdfs', 'links', 'code', 'images'] as const;
type ResourceType = typeof resourceTypes[number];

const subjects = ['Math', 'CS', 'Physics', 'Chemistry', 'Languages', 'Biology', 'History', 'Literature'];

interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  subject: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  tags: string[];
  downloads: number;
  url?: string;
}

const mockResources: Resource[] = [
  { id: 'r1', type: 'notes', title: 'Calculus II - Integration Techniques', subject: 'Math', content: 'Complete notes on integration by parts, trigonometric substitution, partial fractions, and improper integrals with step-by-step examples and practice problems.', author: 'Dr. Sarah Miller', authorImage: '', date: new Date(Date.now() - 86400000).toISOString(), tags: ['calculus', 'integration', 'advanced'], downloads: 234 },
  { id: 'r2', type: 'pdfs', title: 'Data Structures Cheat Sheet', subject: 'CS', content: 'Comprehensive reference for arrays, linked lists, trees, graphs, hash tables, and sorting algorithms with time/space complexity analysis.', author: 'Prof. James Chen', authorImage: '', date: new Date(Date.now() - 172800000).toISOString(), tags: ['algorithms', 'dsa', 'reference'], downloads: 567 },
  { id: 'r3', type: 'links', title: 'Interactive Physics Simulations', subject: 'Physics', content: 'Collection of PhET interactive simulations for mechanics, electromagnetism, thermodynamics, and quantum physics concepts.', author: 'Physics Dept', authorImage: '', date: new Date(Date.now() - 259200000).toISOString(), tags: ['simulations', 'interactive', 'visualization'], downloads: 189, url: 'https://phet.colorado.edu' },
  { id: 'r4', type: 'code', title: 'NLP Text Classifier', subject: 'CS', content: 'Python implementation of a text classification pipeline using TF-IDF vectorization and logistic regression with scikit-learn.', author: 'ML Group', authorImage: '', date: new Date(Date.now() - 345600000).toISOString(), tags: ['python', 'machine-learning', 'nlp'], downloads: 123 },
  { id: 'r5', type: 'images', title: 'Organic Chemistry Reaction Map', subject: 'Chemistry', content: 'Visual map of major organic chemistry reactions including substitution, elimination, addition, and rearrangement pathways.', author: 'Chem Lab', authorImage: '', date: new Date(Date.now() - 432000000).toISOString(), tags: ['organic', 'reactions', 'visual'], downloads: 445 },
  { id: 'r6', type: 'notes', title: 'Linear Algebra - Vector Spaces', subject: 'Math', content: 'Lecture notes covering vector spaces, subspaces, linear independence, basis, dimension, and linear transformations with proofs.', author: 'Dr. Emily Park', authorImage: '', date: new Date(Date.now() - 518400000).toISOString(), tags: ['linear-algebra', 'vectors', 'proofs'], downloads: 312 },
  { id: 'r7', type: 'pdfs', title: 'Spanish Grammar Guide', subject: 'Languages', content: 'Complete grammar reference for Spanish including verb conjugations, tenses, pronouns, and sentence structure with examples.', author: 'Language Center', authorImage: '', date: new Date(Date.now() - 604800000).toISOString(), tags: ['spanish', 'grammar', 'reference'], downloads: 678 },
  { id: 'r8', type: 'code', title: 'React Custom Hooks Collection', subject: 'CS', content: 'Collection of reusable React custom hooks including useDebounce, useLocalStorage, useMediaQuery, and useIntersectionObserver.', author: 'Web Dev Team', authorImage: '', date: new Date(Date.now() - 691200000).toISOString(), tags: ['react', 'hooks', 'javascript'], downloads: 891 },
  { id: 'r9', type: 'images', title: 'Human Anatomy Diagram', subject: 'Biology', content: 'Detailed anatomical diagrams of the human skeletal, muscular, circulatory, and nervous systems with labeled components.', author: 'Bio Dept', authorImage: '', date: new Date(Date.now() - 777600000).toISOString(), tags: ['anatomy', 'biology', 'diagrams'], downloads: 234 },
  { id: 'r10', type: 'links', title: 'World History Timeline', subject: 'History', content: 'Interactive timeline of major world events from ancient civilizations to modern era with detailed descriptions and media.', author: 'History Guild', authorImage: '', date: new Date(Date.now() - 864000000).toISOString(), tags: ['history', 'timeline', 'interactive'], downloads: 156, url: 'https://worldhistory.org' },
  { id: 'r11', type: 'notes', title: 'Literary Analysis: Modernist Poetry', subject: 'Literature', content: 'Analysis of modernist poetry techniques including stream of consciousness, fragmentation, and allusion with examples from Eliot, Pound, and Woolf.', author: 'Prof. Maria Santos', authorImage: '', date: new Date(Date.now() - 950400000).toISOString(), tags: ['poetry', 'modernism', 'literary-analysis'], downloads: 89 },
  { id: 'r12', type: 'pdfs', title: 'Statistics Formula Sheet', subject: 'Math', content: 'Essential formulas for probability, distributions, hypothesis testing, regression analysis, and Bayesian statistics.', author: 'Statistics Dept', authorImage: '', date: new Date(Date.now() - 1036800000).toISOString(), tags: ['statistics', 'formulas', 'reference'], downloads: 723 },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  notes: { icon: FileText, color: 'text-blue-500 bg-blue-500/10', label: 'Notes' },
  pdfs: { icon: BookOpen, color: 'text-red-500 bg-red-500/10', label: 'PDFs' },
  links: { icon: Link2, color: 'text-emerald-500 bg-emerald-500/10', label: 'Links' },
  code: { icon: Code2, color: 'text-purple-500 bg-purple-500/10', label: 'Code' },
  images: { icon: ImageIcon, color: 'text-amber-500 bg-amber-500/10', label: 'Images' },
};

export function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{ name: string; size: number }[]>([]);

  const filteredResources = useMemo(() => {
    let result = mockResources;
    if (activeTab !== 'all') result = result.filter(r => r.type === activeTab);
    if (subjectFilter !== 'all') result = result.filter(r => r.subject === subjectFilter);
    if (searchQuery) result = result.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return result;
  }, [activeTab, subjectFilter, searchQuery]);

  const tabCounts = useMemo(() => ({
    all: mockResources.length,
    notes: mockResources.filter(r => r.type === 'notes').length,
    pdfs: mockResources.filter(r => r.type === 'pdfs').length,
    links: mockResources.filter(r => r.type === 'links').length,
    code: mockResources.filter(r => r.type === 'code').length,
    images: mockResources.filter(r => r.type === 'images').length,
  }), []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Resources</h1>
          <p className="text-muted-foreground mt-1">Shared study materials and documents</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-blue-500">
              <Upload className="h-4 w-4" />
              Upload Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Resource</DialogTitle>
              <DialogDescription>Share study materials with your peers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }));
                  setUploadFiles(prev => [...prev, ...files]);
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <ArrowUpFromLine className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground">Supported: PDF, DOC, PPT, TXT, PNG, JPG, ZIP (max 25MB)</p>
                <input id="file-upload" type="file" multiple className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files || []).map(f => ({ name: f.name, size: f.size }));
                    setUploadFiles(prev => [...prev, ...files]);
                  }} />
              </div>
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground">({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0"
                        onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowUploadDialog(false); setUploadFiles([]); }}>Cancel</Button>
              <Button disabled={uploadFiles.length === 0} onClick={() => { setShowUploadDialog(false); setUploadFiles([]); }}>Upload</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {resourceTypes.map(type => (
              <TabsTrigger key={type} value={type} className="gap-1.5 capitalize">
                {type !== 'all' && React.createElement(typeConfig[type]?.icon || FileIcon, { className: 'h-3.5 w-3.5' })}
                {type === 'all' ? 'All' : typeConfig[type]?.label || type}
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {tabCounts[type as keyof typeof tabCounts]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            {filteredResources.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  {activeTab === 'all' ? (
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    React.createElement(typeConfig[activeTab as ResourceType]?.icon || FileIcon, {
                      className: 'h-8 w-8 text-muted-foreground'
                    })
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-1">No resources found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {searchQuery || subjectFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : `No ${activeTab === 'all' ? '' : typeConfig[activeTab as ResourceType]?.label.toLowerCase() || ''} resources yet`}
                </p>
                <Button variant="outline" className="mt-4 gap-2" onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4" /> Upload a resource
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredResources.map((resource, i) => {
                    const cfg = typeConfig[resource.type] || { icon: FileIcon, color: 'text-muted-foreground bg-muted' };
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={resource.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <Card className="group card-hover">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className={cn('p-2 rounded-lg', cfg.color)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <Badge variant="secondary" className="text-[10px]">{resource.subject}</Badge>
                            </div>
                            <CardTitle className="text-sm leading-tight">{resource.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2">
                              {truncate(resource.content, 100)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {resource.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={resource.authorImage} />
                                  <AvatarFallback className="text-[8px]">{getInitials(resource.author)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground truncate">{formatDate(resource.date)}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                {resource.type === 'links' ? <Link2 className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                                {resource.type === 'links' ? 'Open' : 'Download'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
