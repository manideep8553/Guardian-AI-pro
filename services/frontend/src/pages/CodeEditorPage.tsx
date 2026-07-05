import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Play, RotateCcw, Download, CheckCircle, XCircle,
  FileCode, Terminal, FlaskConical, Maximize2, Minimize2,
  Sun, Moon, Palette, History, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '../components/ui/select';
import { cn, timeAgo } from '../lib/utils';

const languages = [
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'r', label: 'R' },
  { value: 'scala', label: 'Scala' },
  { value: 'perl', label: 'Perl' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'lua', label: 'Lua' },
  { value: 'dart', label: 'Dart' },
];

const themes = [
  { value: 'vs-dark', label: 'VS Dark', icon: Moon },
  { value: 'vs-light', label: 'VS Light', icon: Sun },
  { value: 'github-dark', label: 'GitHub Dark', icon: Palette },
  { value: 'monokai', label: 'Monokai', icon: Palette },
];

const starterCode: Record<string, string> = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  python: 'def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()',
  javascript: 'function main() {\n    console.log("Hello, World!");\n}\n\nmain();',
  typescript: 'function main(): void {\n    console.log("Hello, World!");\n}\n\nmain();',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  rust: 'fn main() {\n    println!("Hello, World!");\n}',
  ruby: 'def main\n  puts "Hello, World!"\nend\n\nmain',
  php: '<?php\necho "Hello, World!\\n";\n?>',
  swift: 'import Foundation\n\nprint("Hello, World!")',
  kotlin: 'fun main() {\n    println("Hello, World!")\n}',
  r: 'main <- function() {\n    print("Hello, World!")\n}\n\nmain()',
  scala: 'object Main extends App {\n  println("Hello, World!")\n}',
  perl: '#!/usr/bin/perl\nuse strict;\nuse warnings;\n\nprint "Hello, World!\\n";',
  haskell: 'main :: IO ()\nmain = putStrLn "Hello, World!"',
  lua: 'function main()\n    print("Hello, World!")\nend\n\nmain()',
  dart: 'void main() {\n  print("Hello, World!");\n}',
};

const mockHistory = [
  { id: 'h1', language: 'Python', fileName: 'fibonacci.py', status: 'passed', time: new Date(Date.now() - 300000).toISOString() },
  { id: 'h2', language: 'JavaScript', fileName: 'sort.js', status: 'passed', time: new Date(Date.now() - 1800000).toISOString() },
  { id: 'h3', language: 'C++', fileName: 'linked_list.cpp', status: 'failed', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 'h4', language: 'Python', fileName: 'matrix_mult.py', status: 'passed', time: new Date(Date.now() - 7200000).toISOString() },
  { id: 'h5', language: 'Rust', fileName: 'parser.rs', status: 'error', time: new Date(Date.now() - 14400000).toISOString() },
  { id: 'h6', language: 'TypeScript', fileName: 'api.ts', status: 'passed', time: new Date(Date.now() - 28800000).toISOString() },
  { id: 'h7', language: 'Go', fileName: 'server.go', status: 'passed', time: new Date(Date.now() - 57600000).toISOString() },
  { id: 'h8', language: 'Java', fileName: 'Sorting.java', status: 'failed', time: new Date(Date.now() - 115200000).toISOString() },
  { id: 'h9', language: 'Python', fileName: 'ml_model.py', status: 'passed', time: new Date(Date.now() - 230400000).toISOString() },
  { id: 'h10', language: 'Ruby', fileName: 'scraper.rb', status: 'passed', time: new Date(Date.now() - 460800000).toISOString() },
];

export function CodeEditorPage() {
  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState('vs-dark');
  const [code, setCode] = useState(starterCode['python']);
  const [fileName, setFileName] = useState('main.py');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [outputTab, setOutputTab] = useState('output');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<Parameters<NonNullable<React.ComponentProps<typeof Editor>['onMount']>>[0] | null>(null);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(starterCode[lang] || '');
    const extMap: Record<string, string> = {
      c: '.c', cpp: '.cpp', java: '.java', python: '.py', javascript: '.js',
      typescript: '.ts', go: '.go', rust: '.rs', ruby: '.rb', php: '.php',
      swift: '.swift', kotlin: '.kt', r: '.r', scala: '.scala', perl: '.pl',
      haskell: '.hs', lua: '.lua', dart: '.dart',
    };
    setFileName(`main${extMap[lang] || '.txt'}`);
  }, []);

  const handleEditorMount = useCallback((editor: Parameters<NonNullable<React.ComponentProps<typeof Editor>['onMount']>>[0]) => {
    editorRef.current = editor;
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setOutputTab('output');
    const langMap: Record<string, string> = {
      python: 'Python', javascript: 'Node.js', typescript: 'TypeScript',
      c: 'C (GCC)', cpp: 'C++ (G++)', java: 'Java', go: 'Go', rust: 'Rust',
      ruby: 'Ruby', php: 'PHP', swift: 'Swift', kotlin: 'Kotlin',
      r: 'R', scala: 'Scala', perl: 'Perl', haskell: 'Haskell',
      lua: 'Lua', dart: 'Dart',
    };
    setOutput(`[Running] ${langMap[language] || language}\n$ ${fileName}\n\nSimulated output for ${language}:\nHello, World!\n\n[Done] exited with code=0 in 0.042s`);
    setTimeout(() => setIsRunning(false), 1200);
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Code Editor</h1>
          <p className="text-muted-foreground mt-1">Write, run, and collaborate on code</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            History
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-blue-500" onClick={handleRun} disabled={isRunning}>
            {isRunning ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </Button>
        </div>
      </motion.div>

      <div className={cn('flex gap-4', isFullscreen && 'fixed inset-0 z-50 bg-background p-4')}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col gap-3 min-w-0"
        >
          <Card className="flex-1 flex flex-col">
            <CardHeader className="py-2.5 px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    className="h-7 w-40 text-xs border-none bg-transparent px-0 focus-visible:ring-0"
                  />
                  <Badge variant="secondary" className="text-[10px]">{language}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="h-7 w-[120px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="h-3 w-3" />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="h-7 w-[130px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[400px]">
              <Editor
                height="100%"
                language={language}
                theme={theme}
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  lineNumbers: 'on',
                  minimap: { enabled: true },
                  bracketPairColorization: { enabled: true },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  wordWrap: 'on',
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border">
              <Tabs value={outputTab} onValueChange={setOutputTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="output" className="text-xs gap-1.5">
                    <Terminal className="h-3.5 w-3.5" /> Output
                  </TabsTrigger>
                  <TabsTrigger value="console" className="text-xs gap-1.5">
                    <Terminal className="h-3.5 w-3.5" /> Console
                  </TabsTrigger>
                  <TabsTrigger value="test" className="text-xs gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" /> Test Results
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="output" className="m-0">
                <div className="p-3 font-mono text-xs leading-relaxed min-h-[80px] max-h-[160px] overflow-auto bg-muted/30">
                  {output || (
                    <span className="text-muted-foreground">Run your code to see output here...</span>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="console" className="m-0">
                <div className="p-3 font-mono text-xs text-muted-foreground min-h-[80px] max-h-[160px] overflow-auto">
                  Interactive console (simulated)
                </div>
              </TabsContent>
              <TabsContent value="test" className="m-0">
                <div className="p-3 text-xs text-muted-foreground min-h-[80px] max-h-[160px] overflow-auto">
                  Test results will appear here after running tests.
                </div>
              </TabsContent>
              <div className="px-3 pb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Custom Input</label>
                <Textarea
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Provide input for your program..."
                  className="min-h-[60px] text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-72 shrink-0 hidden lg:block"
            >
              <Card className="h-full">
                <CardHeader className="py-3 px-4 border-b border-border">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Session History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="p-2 space-y-1">
                      {mockHistory.map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium truncate">{item.fileName}</span>
                            {item.status === 'passed' ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : item.status === 'failed' ? (
                              <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{item.language}</Badge>
                            <span>{timeAgo(item.time)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
