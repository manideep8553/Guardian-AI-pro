import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  FileText, Download, Calendar, FileSpreadsheet,
  File, CheckCircle, ArrowDown,
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const reportTypes = [
  { id: 'compliance', label: 'Compliance Report', icon: FileText, desc: 'Safety compliance across departments' },
  { id: 'incidents', label: 'Incidents Report', icon: FileText, desc: 'All reported incidents and resolutions' },
  { id: 'audits', label: 'Audit Report', icon: FileText, desc: 'Internal and external audit findings' },
  { id: 'performance', label: 'Worker Performance', icon: FileText, desc: 'Individual and team safety scores' },
  { id: 'analytics', label: 'Safety Analytics', icon: FileText, desc: 'Comprehensive safety metrics and trends' },
] as const;

const formats = ['PDF', 'Excel', 'CSV'] as const;

const samplePreview = [
  { metric: 'Total Workers', value: '284', change: '+12' },
  { metric: 'Incidents (MTD)', value: '18', change: '-5' },
  { metric: 'Compliance Rate', value: '94%', change: '+2%' },
  { metric: 'Avg Risk Score', value: '23%', change: '-3%' },
  { metric: 'Open Incidents', value: '7', change: '-2' },
  { metric: 'Resolved Rate', value: '91%', change: '+4%' },
];

const recentReports = [
  { name: 'Monthly Compliance Report - June 2026', type: 'PDF', date: '2026-07-01', size: '2.4 MB', status: 'ready' },
  { name: 'Safety Analytics Q2 2026', type: 'PDF', date: '2026-06-30', size: '4.8 MB', status: 'ready' },
  { name: 'Incident Report - Weekly Summary', type: 'Excel', date: '2026-06-28', size: '1.2 MB', status: 'ready' },
  { name: 'Worker Performance - Assembly Dept', type: 'CSV', date: '2026-06-25', size: '0.8 MB', status: 'ready' },
  { name: 'Audit Findings - Chemical Storage', type: 'PDF', date: '2026-06-20', size: '3.1 MB', status: 'ready' },
];

const typeIcons: Record<string, React.ElementType> = {
  PDF: File,
  Excel: FileSpreadsheet,
  CSV: FileText,
};

export function ReportsPage() {
  const [selectedType, setSelectedType] = useState('compliance');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Reports</h2>
          <p className="text-muted-foreground">Generate and download safety reports</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <FileText className="h-4 w-4 text-blue-400" />
              Generate New Report
            </CardTitle>
            <CardDescription>Select report type, configure options, and generate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-white">Report Type</p>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                {reportTypes.map((rt) => {
                  const Icon = rt.icon;
                  const isActive = selectedType === rt.id;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setSelectedType(rt.id)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all ${
                        isActive
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`} />
                      <span className="text-sm font-medium">{rt.label}</span>
                      <span className="text-[10px]">{rt.desc}</span>
                      {isActive && <CheckCircle className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-white">Date Range</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-white">Format</p>
                <div className="flex gap-2">
                  {formats.map((fmt) => (
                    <Button
                      key={fmt}
                      variant={selectedFormat === fmt ? 'default' : 'outline'}
                      onClick={() => setSelectedFormat(fmt)}
                      className={selectedFormat !== fmt ? 'border-border text-muted-foreground' : ''}
                    >
                      {fmt === 'PDF' && <File className="mr-2 h-4 w-4" />}
                      {fmt === 'Excel' && <FileSpreadsheet className="mr-2 h-4 w-4" />}
                      {fmt === 'CSV' && <FileText className="mr-2 h-4 w-4" />}
                      {fmt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto">
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate & Download
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <FileText className="h-4 w-4 text-green-400" />
              Preview
            </CardTitle>
            <CardDescription>Sample data preview for the selected report type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 text-left font-medium text-muted-foreground">Metric</th>
                    <th className="py-2 pr-4 text-left font-medium text-muted-foreground">Value</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {samplePreview.map((row) => (
                    <tr key={row.metric} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-white">{row.metric}</td>
                      <td className="py-2 pr-4 text-white">{row.value}</td>
                      <td className={`py-2 ${row.change.startsWith('+') ? 'text-green-400' : row.change.startsWith('-') ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {row.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Download className="h-4 w-4 text-purple-400" />
              Recent Reports
            </CardTitle>
            <CardDescription>Previously generated reports available for download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentReports.map((r, idx) => {
                const Icon = typeIcons[r.type] || File;
                return (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{r.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {r.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {r.date}
                          </span>
                          <span>{r.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <Badge className="text-[10px] text-green-400 border-green-500/30 bg-green-500/10">Ready</Badge>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
