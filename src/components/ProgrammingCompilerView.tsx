import React, { useState, useEffect } from 'react';
import {
  Code, Play, CheckCircle2, RotateCcw, Wifi, WifiOff, FileCode, Terminal,
  Send, Sparkles, ChevronRight, HelpCircle, Layers
} from 'lucide-react';
import { ProgrammingProblem, ProgrammingSubmission } from '../types';
import { codingService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface ProgrammingCompilerViewProps {
  isOffline: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const ProgrammingCompilerView: React.FC<ProgrammingCompilerViewProps> = ({ isOffline, onNavigateTab }) => {
  const [problems, setProblems] = useState<ProgrammingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProgrammingProblem | null>(null);

  const [language, setLanguage] = useState<'python' | 'cpp' | 'c' | 'java'>('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<ProgrammingSubmission | null>(null);
  const [activeMobileView, setActiveMobileView] = useState<'problems' | 'editor' | 'output'>('editor');

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const list = await codingService.getProblems();
      setProblems(list);
      if (list.length > 0) {
        handleSelectProblem(list[0]);
      }
    } catch (e) {
      console.error('Failed to load programming problems', e);
    }
  };

  const handleSelectProblem = (p: ProgrammingProblem) => {
    setSelectedProblem(p);
    const initialCode = p.starterCode?.[language] || getDefaultTemplate(language);
    setCode(initialCode);
    setOutput('');
    setError('');
    setLastSubmission(null);
    setActiveMobileView('editor');
  };

  const handleLanguageChange = (lang: 'python' | 'cpp' | 'c' | 'java') => {
    setLanguage(lang);
    if (selectedProblem?.starterCode?.[lang]) {
      setCode(selectedProblem.starterCode[lang]);
    } else {
      setCode(getDefaultTemplate(lang));
    }
  };

  const getDefaultTemplate = (lang: string) => {
    switch (lang) {
      case 'python':
        return '# Python 3 Environment\ndef solve():\n    print("Hello from Skill Forge Compiler!")\n\nsolve()';
      case 'cpp':
        return '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from Skill Forge C++ Compiler!" << endl;\n    return 0;\n}';
      case 'c':
        return '#include <stdio.h>\n\nint main() {\n    printf("Hello from Skill Forge C Compiler!\\n");\n    return 0;\n}';
      case 'java':
        return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Skill Forge Java Compiler!");\n    }\n}';
      default:
        return '';
    }
  };

  const isCodeModified = () => {
    if (!selectedProblem) return false;
    const starter = selectedProblem.starterCode?.[language] || getDefaultTemplate(language);
    return code.trim() !== starter.trim();
  };

  const handleRunCode = async () => {
    setExecuting(true);
    setOutput('Compiling and executing program in sandbox environment...');
    setError('');
    setActiveMobileView('output');

    try {
      const res = await codingService.executeCode(code, language, input);
      setOutput(res.output);
      setError(res.error || '');
      setExecutionTime(res.executionTimeMs);
    } catch (err: any) {
      setError(err.message || 'Execution error');
      setOutput('');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!selectedProblem) return;
    setSubmitting(true);
    setActiveMobileView('output');

    try {
      const sub = await codingService.submitSolution(selectedProblem.id, code, language, isOffline);
      setLastSubmission(sub);
      setOutput(`✅ All test cases passed! Score: ${sub.score}/100.`);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Back & Breadcrumb Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label="Back to Dashboard"
            isDirty={isCodeModified()}
            onClick={() => {
              if (onNavigateTab) onNavigateTab('dashboard');
              else {
                window.history.pushState({}, '', '/student/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          />
          <Breadcrumbs
            items={[
              { label: 'Dashboard', onClick: () => onNavigateTab ? onNavigateTab('dashboard') : null },
              { label: 'Compiler & Practice', onClick: () => setSelectedProblem(problems[0] || null) },
              { label: selectedProblem?.title || 'Interactive Compiler', isCurrent: true }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {problems.length} Practice Problems
        </span>
      </div>

      {/* Header with Mode Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Code className="w-6 h-6 text-indigo-400" />
              <span>Offline / Online Programming Compiler</span>
            </h1>

            {/* Offline Compiler Status Indicator */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center space-x-1.5 ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOffline ? 'Offline Mode' : 'Online Mode'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">Multi-language execution engine for C, C++, Java, and Python with test case evaluation.</p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-2" role="group" aria-label="Select Programming Language">
          {(['python', 'cpp', 'c', 'java'] as const).map(lang => (
            <button
              type="button"
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition border backdrop-blur-md min-h-[40px] ${
                language === lang
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang === 'cpp' ? 'C++' : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Tab Switcher (< lg) */}
      <div className="lg:hidden flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveMobileView('problems')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeMobileView === 'problems' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Problems ({problems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileView('editor')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeMobileView === 'editor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Code Editor
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileView('output')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeMobileView === 'output' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Output & Stdin
        </button>
      </div>

      {/* Main Grid: Left Problems List, Middle Code Editor, Right Console Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* Left Column: Problem List (3 cols) */}
        <div className={`lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-4 space-y-3 backdrop-blur-md shadow-xl ${
          activeMobileView === 'problems' ? 'block' : 'hidden lg:block'
        }`}>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Practice Problems</h3>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {problems.map(prob => {
              const isSelected = selectedProblem?.id === prob.id;
              return (
                <div
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className={`p-3 rounded-2xl border cursor-pointer text-xs transition backdrop-blur-md ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold shadow-lg'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="line-clamp-1">{prob.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prob.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Code Editor & Execution Controls (6 cols) */}
        <div className={`lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col justify-between space-y-4 backdrop-blur-md shadow-xl ${
          activeMobileView === 'editor' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Selected Problem Description Header */}
          {selectedProblem && (
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300">{selectedProblem.title}</span>
                <span className="text-[10px] text-slate-400">{selectedProblem.category}</span>
              </div>
              <p className="text-slate-300">{selectedProblem.description}</p>
            </div>
          )}

          {/* Code Editor Canvas */}
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <label htmlFor="code-editor-input" className="font-mono text-[11px] text-indigo-300">
                main.{language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language}
              </label>
              <button
                type="button"
                onClick={() => setCode(selectedProblem?.starterCode?.[language] || getDefaultTemplate(language))}
                className="text-slate-400 hover:text-white flex items-center space-x-1"
                aria-label="Reset code to default starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <textarea
              id="code-editor-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 min-h-[360px] p-4 bg-slate-950/70 border border-white/10 rounded-2xl font-mono text-xs text-emerald-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed resize-none shadow-inner backdrop-blur-md"
              aria-label="Code Editor"
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <span className="text-[11px] text-slate-400 font-mono">
              {isOffline ? 'Local Code Sandbox Active' : 'Server Execution Sandbox Active'}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={executing}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/15 flex items-center space-x-1.5 transition backdrop-blur-md min-h-[40px]"
              >
                <Play className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />
                <span>{executing ? 'Executing...' : 'Run Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitSolution}
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg border border-white/20 flex items-center space-x-1.5 transition backdrop-blur-md min-h-[40px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Solution'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Console Terminal Output (3 cols) */}
        <div className={`lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col space-y-4 backdrop-blur-md shadow-xl ${
          activeMobileView === 'output' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Console Stderr/Stdout</span>
            </span>
            {executionTime && (
              <span className="text-[10px] font-mono text-emerald-300">{executionTime}ms</span>
            )}
          </div>

          {/* Output Display Box */}
          <div className="flex-1 bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 font-mono text-xs overflow-y-auto min-h-[200px] backdrop-blur-md">
            {error ? (
              <p className="text-rose-400">{error}</p>
            ) : output ? (
              <p className="text-slate-200 whitespace-pre-wrap">{output}</p>
            ) : (
              <p className="text-slate-500 italic">Click "Run Code" or "Submit Solution" to see execution output.</p>
            )}
          </div>

          {/* Submission Status Alert */}
          {lastSubmission && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl space-y-1 backdrop-blur-md">
              <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Status: {lastSubmission.status}</span>
              </span>
              <p className="text-[11px] text-slate-300">Passed {lastSubmission.passedCases}/{lastSubmission.totalCases} test cases.</p>
            </div>
          )}

          {/* Custom Input Field */}
          <div className="space-y-1.5">
            <label htmlFor="custom-stdin-input" className="text-[11px] font-semibold text-slate-300 block">
              Custom Stdin Input
            </label>
            <input
              id="custom-stdin-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. 5 10 15"
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md placeholder:text-slate-500 min-h-[38px]"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
