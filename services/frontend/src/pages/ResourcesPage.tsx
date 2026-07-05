import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Link2, Code2, Shield,
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

const categories = ['Safety', 'Compliance', 'Maintenance', 'Training', 'Emergency'];

interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  category: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  tags: string[];
  downloads: number;
  url?: string;
}

const mockResources: Resource[] = [
  { id: 'r1', type: 'notes', title: 'Safety Protocol v3.2', category: 'Safety', content: 'Complete safety protocols covering PPE requirements, hazard communication, lockout/tagout procedures, and emergency response guidelines for all plant zones.', author: 'Safety Dept', authorImage: '', date: new Date(Date.now() - 86400000).toISOString(), tags: ['protocols', 'safety', 'ppe'], downloads: 234 },
  { id: 'r2', type: 'pdfs', title: 'Emergency Evacuation Map', category: 'Emergency', content: 'Comprehensive evacuation route maps for all facility zones including assembly points, emergency exits, fire extinguisher locations, and first aid stations.', author: 'Emergency Response Team', authorImage: '', date: new Date(Date.now() - 172800000).toISOString(), tags: ['evacuation', 'maps', 'emergency'], downloads: 567 },
  { id: 'r3', type: 'links', title: 'Equipment Manual - Assembly Line 3', category: 'Maintenance', content: 'Complete operation and maintenance manual for Assembly Line 3 equipment including troubleshooting guides, parts lists, and safety interlocks.', author: 'Engineering Dept', authorImage: '', date: new Date(Date.now() - 259200000).toISOString(), tags: ['manual', 'equipment', 'maintenance'], downloads: 189, url: 'https://docs.guardianai.com/line3' },
  { id: 'r4', type: 'code', title: 'Incident Reporting Script', category: 'Compliance', content: 'Python automation script for generating incident report summaries from sensor logs and submitting them to the compliance database.', author: 'Data Team', authorImage: '', date: new Date(Date.now() - 345600000).toISOString(), tags: ['python', 'automation', 'reporting'], downloads: 123 },
  { id: 'r5', type: 'images', title: 'Chemical Handling Guide', category: 'Safety', content: 'Visual guide for proper chemical handling, storage, and disposal procedures including HAZMAT labeling and spill containment protocols.', author: 'Safety Office', authorImage: '', date: new Date(Date.now() - 432000000).toISOString(), tags: ['chemical', 'hazmat', 'safety'], downloads: 445 },
  { id: 'r6', type: 'notes', title: 'OSHA Compliance Checklist', category: 'Compliance', content: 'Comprehensive OSHA compliance checklist covering workplace safety standards, recordkeeping, training requirements, and inspection preparation.', author: 'Compliance Officer', authorImage: '', date: new Date(Date.now() - 518400000).toISOString(), tags: ['osha', 'compliance', 'inspection'], downloads: 312 },
  { id: 'r7', type: 'pdfs', title: 'Fire Safety Training Guide', category: 'Training', content: 'Complete fire safety training materials including fire prevention, extinguisher operation, evacuation procedures, and fire warden responsibilities.', author: 'Training Center', authorImage: '', date: new Date(Date.now() - 604800000).toISOString(), tags: ['fire', 'training', 'safety'], downloads: 678 },
  { id: 'r8', type: 'code', title: 'Sensor Monitoring Dashboard', category: 'Maintenance', content: 'React-based dashboard for real-time monitoring of gas sensors, temperature gauges, and pressure readings across all plant zones.', author: 'Dev Team', authorImage: '', date: new Date(Date.now() - 691200000).toISOString(), tags: ['react', 'sensors', 'monitoring'], downloads: 891 },
  { id: 'r9', type: 'images', title: 'PPE Compatibility Chart', category: 'Safety', content: 'Detailed reference chart showing required personal protective equipment for each zone and task type with compatibility and rating specifications.', author: 'Safety Dept', authorImage: '', date: new Date(Date.now() - 777600000).toISOString(), tags: ['ppe', 'safety', 'reference'], downloads: 234 },
  { id: 'r10', type: 'links', title: 'Confined Space Entry Guide', category: 'Training', content: 'Interactive training guide for confined space entry procedures including atmospheric testing, permits, rescue plans, and equipment requirements.', author: 'Training Dept', authorImage: '', date: new Date(Date.now() - 864000000).toISOString(), tags: ['confined-space', 'training', 'safety'], downloads: 156, url: 'https://training.guardianai.com/confined-space' },
  { id: 'r11', type: 'notes', title: 'Incident Report Template', category: 'Compliance', content: 'Standardized incident report template for documenting workplace incidents, near misses, and hazardous conditions with root cause analysis section.', author: 'Compliance Dept', authorImage: '', date: new Date(Date.now() - 950400000).toISOString(), tags: ['report', 'incident', 'template'], downloads: 89 },
  { id: 'r12', type: 'pdfs', title: 'Emergency Response Plan', category: 'Emergency', content: 'Facility-wide emergency response plan covering natural disasters, chemical spills, fires, medical emergencies, and active threat scenarios.', author: 'Safety Committee', authorImage: '', date: new Date(Date.now() - 1036800000).toISOString(), tags: ['emergency', 'response', 'plan'], downloads: 723 },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  notes: { icon: FileText, color: 'text-blue-500 bg-blue-500/10', label: 'Notes' },
  pdfs: { icon: Shield, color: 'text-red-500 bg-red-500/10', label: 'PDFs' },
  links: { icon: Link2, color: 'text-emerald-500 bg-emerald-500/10', label: 'Links' },
  code: { icon: Code2, color: 'text-purple-500 bg-purple-500/10', label: 'Code' },
  images: { icon: ImageIcon, color: 'text-amber-500 bg-amber-500/10', label: 'Images' },
};

export function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{ name: string; size: number }[]>([]);

  const filteredResources = useMemo(() => {
    let result = mockResources;
    if (activeTab !== 'all') result = result.filter(r => r.type === activeTab);
    if (categoryFilter !== 'all') result = result.filter(r => r.category === categoryFilter);
    if (searchQuery) result = result.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return result;
  }, [activeTab, categoryFilter, searchQuery]);

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
          <p className="text-muted-foreground mt-1">Shared safety documents and compliance materials</p>
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
              <DialogDescription>Share safety documents with your team</DialogDescription>
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                  {searchQuery || categoryFilter !== 'all'
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
                              <Badge variant="secondary" className="text-[10px]">{resource.category}</Badge>
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
