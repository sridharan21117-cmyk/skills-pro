import React, { useState, useEffect } from 'react';
import {
  Brain, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle, ArrowRight,
  RotateCcw, Sparkles, Filter, ChevronRight, BookOpen, Layers
} from 'lucide-react';
import { Question, AptitudeTest, AssessmentAttempt } from '../types';
import { aptitudeService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface AptitudePracticeViewProps {
  onAttemptCompleted: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AptitudePracticeView: React.FC<AptitudePracticeViewProps> = ({ onAttemptCompleted, onNavigateTab }) => {
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTest, setActiveTest] = useState<AptitudeTest | null>(null);

  // Test Runner State
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<AssessmentAttempt | null>(null);

  // Filters State Preservation
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  useEffect(() => {
    loadAptitudeData();
  }, []);

  useEffect(() => {
    let timer: any;
    if (activeTest && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, isSubmitted, timeLeft]);

  const loadAptitudeData = async () => {
    try {
      const [tList, qList] = await Promise.all([
        aptitudeService.getTests(),
        aptitudeService.getQuestions()
      ]);
      setTests(tList);
      setQuestions(qList);
    } catch (e) {
      console.error('Failed to load aptitude data', e);
    }
  };

  const handleStartTest = (test: AptitudeTest) => {
    setActiveTest(test);
    const matchedQs = questions.filter(q => (test.questionIds || []).includes(q.id));
    setTestQuestions(matchedQs.length > 0 ? matchedQs : questions.slice(0, 5));
    setCurrentIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setTimeLeft(test.durationMinutes * 60);
    setIsSubmitted(false);
    setLastAttempt(null);
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const toggleReview = (qId: string) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest || isSubmitted) return;
    setIsSubmitted(true);

    try {
      const attempt = await aptitudeService.submitTestAttempt(activeTest.id, userAnswers);
      setLastAttempt(attempt);
      onAttemptCompleted();
    } catch (e) {
      console.error('Failed to submit test attempt', e);
    }
  };

  const currentQ = testQuestions[currentIndex];
  const categories = ['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Placement Practice'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label={activeTest ? "Back to Aptitude Hub" : "Back to Dashboard"}
            isDirty={Boolean(activeTest && !isSubmitted)}
            onClick={() => {
              if (activeTest) {
                setActiveTest(null);
              } else if (onNavigateTab) {
                onNavigateTab('dashboard');
              } else {
                window.history.pushState({}, '', '/student/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          />
          <Breadcrumbs
            items={
              activeTest ? [
                { label: 'Aptitude Hub', onClick: () => setActiveTest(null) },
                { label: activeTest.title, isCurrent: !isSubmitted },
                ...(isSubmitted ? [{ label: 'Results & Solutions', isCurrent: true }] : [])
              ] : [
                { label: 'Dashboard', onClick: () => onNavigateTab ? onNavigateTab('dashboard') : null },
                { label: 'Aptitude Practice & Tests', isCurrent: true }
              ]
            }
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {activeTest ? `Assessment: ${activeTest.title}` : `${tests.length} Test Modules Available`}
        </span>
      </div>

      {/* Test Active View */}
      {activeTest && !isSubmitted ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-md">
          
          {/* Test Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                {activeTest.companyPattern || activeTest.category}
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">{activeTest.title}</h2>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
              <div className="font-mono text-base font-bold text-amber-300">
                {Math.floor(timeLeft / 60)}m {String(timeLeft % 60).padStart(2, '0')}s
              </div>
            </div>
          </div>

          {/* Question Nav Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {testQuestions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]);
              const isMarked = Boolean(markedForReview[q.id]);
              const isCurrent = idx === currentIndex;

              return (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to question ${idx + 1}`}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center border backdrop-blur-md min-w-[36px] min-h-[36px] ${
                    isCurrent ? 'ring-2 ring-indigo-400 border-indigo-300 text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' :
                    isMarked ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    isAnswered ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          {currentQ && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-indigo-300">
                  Question {currentIndex + 1} of {testQuestions.length} ({currentQ.category} • {currentQ.topic})
                </span>
                <span className="font-semibold text-slate-300">
                  Marks: +{currentQ.marks} | Neg: -{currentQ.negativeMarks || 0}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {(currentQ.options || []).map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === opt;
                  return (
                    <button
                      type="button"
                      key={oIdx}
                      onClick={() => handleSelectAnswer(currentQ.id, opt)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition flex items-center justify-between backdrop-blur-md min-h-[48px] ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-indigo-400 text-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => toggleReview(currentQ.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition backdrop-blur-md min-h-[40px] ${
                    markedForReview[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  {markedForReview[currentQ.id] ? 'Unmark Review' : 'Mark for Review'}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-50 text-xs font-bold rounded-xl transition backdrop-blur-md min-h-[40px]"
                  >
                    Previous
                  </button>

                  {currentIndex < testQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg border border-white/20 transition backdrop-blur-md min-h-[40px]"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg border border-white/20 transition backdrop-blur-md min-h-[40px]"
                    >
                      Submit Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : isSubmitted && lastAttempt ? (
        /* Result Scorecard & Explanations */
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 backdrop-blur-md">
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl backdrop-blur-md ${
              lastAttempt.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {lastAttempt.passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h2 className="text-2xl font-black text-white">
              {lastAttempt.passed ? 'Assessment Passed! 🎉' : 'Needs Practice'}
            </h2>
            <p className="text-xs text-slate-300">Scorecard and Step-by-Step Explanations</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 text-center backdrop-blur-md">
            <div>
              <div className="text-xs text-slate-400 font-semibold">Total Score</div>
              <div className="text-xl font-bold text-white mt-1">{lastAttempt.score} / {lastAttempt.totalMarks}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Percentage</div>
              <div className="text-xl font-bold text-indigo-300 mt-1">{lastAttempt.percentage}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Status</div>
              <div className={`text-xl font-bold mt-1 ${lastAttempt.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                {lastAttempt.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Questions</div>
              <div className="text-xl font-bold text-slate-200 mt-1">{testQuestions.length}</div>
            </div>
          </div>

          {/* Detailed Question Explanations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Detailed Solutions & Explanations</h3>
            {testQuestions.map((q, idx) => {
              const uAns = lastAttempt.userAnswers?.[q.id];
              const isCorrect = String(uAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

              return (
                <div key={q.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300">Question {idx + 1}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">{q.question}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Your Answer:</span>
                      <span className={`font-bold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>{uAns || 'Not Answered'}</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Correct Answer:</span>
                      <span className="font-bold text-emerald-300">{q.correctAnswer}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-indigo-300 block">Explanation:</span>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <BackButton
            label="Back to Aptitude Tests Catalog"
            onClick={() => setActiveTest(null)}
            className="w-full py-3 justify-center text-xs"
          />
        </div>
      ) : (
        /* Tests Catalog Overview */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <span>Placement Aptitude & Question Bank</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1">Practice Quantitative, Logical Reasoning, Verbal Ability & TCS/Infosys Company Patterns.</p>
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50 backdrop-blur-md"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Test Cards List */}
          {(() => {
            const filteredTests = tests.filter(test =>
              selectedCategory === 'All' ||
              test.category === selectedCategory ||
              test.companyPattern === selectedCategory
            );

            if (filteredTests.length === 0) {
              return (
                <div className="p-12 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 backdrop-blur-md">
                  <Brain className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No test modules found in category "{selectedCategory}"</p>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                  >
                    View All Categories
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTests.map(test => (
                  <div
                    key={test.id}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all backdrop-blur-md shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                          {test.companyPattern || test.category}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{test.title}</h3>
                        <p className="text-xs text-slate-300 mt-1">{test.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 text-center text-xs backdrop-blur-md">
                      <div>
                        <span className="text-[10px] text-slate-400">Duration</span>
                        <p className="font-bold text-white">{test.durationMinutes} mins</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Questions</span>
                        <p className="font-bold text-white">{test.totalQuestions}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Pass Cutoff</span>
                        <p className="font-bold text-indigo-300">{test.passPercentage}%</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTest(test)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white font-bold text-xs rounded-2xl transition shadow-lg backdrop-blur-md flex items-center justify-center space-x-2"
                    >
                      <span>Start Test Attempt</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
