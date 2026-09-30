import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Plus, Trash2, CheckCircle2, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { UserSkill, Skill, User } from '../types';
import { profileService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface SkillAnalyzerViewProps {
  user: User;
  setActiveTab: (tab: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const SkillAnalyzerView: React.FC<SkillAnalyzerViewProps> = ({ user, setActiveTab, onNavigateTab }) => {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newSkillScore, setNewSkillScore] = useState(80);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const list = await profileService.getSkills();
      setUserSkills(list);
    } catch (e) {
      console.error('Failed to load user skills', e);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const created = await profileService.addSkill(newSkillName.trim(), newSkillLevel, newSkillScore);
      setUserSkills(prev => [...prev, created]);
      setNewSkillName('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to add skill', e);
    }
  };

  // Calculate gaps against Target Career Goal
  const targetGoal = user.careerGoal || 'Full Stack AI Software Engineer';
  const targetSkillRequirements = [
    { name: 'Data Structures & Algorithms', reqScore: 85 },
    { name: 'React.js', reqScore: 80 },
    { name: 'Node.js & Express', reqScore: 75 },
    { name: 'Quantitative Aptitude', reqScore: 80 },
    { name: 'Python Programming', reqScore: 75 }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Back & Breadcrumb Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label="Back to Dashboard"
            isDirty={newSkillName.trim().length > 0}
            onClick={() => {
              if (onNavigateTab) onNavigateTab('dashboard');
              else if (setActiveTab) setActiveTab('dashboard');
              else {
                window.history.pushState({}, '', '/student/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          />
          <Breadcrumbs
            items={[
              { label: 'Dashboard', onClick: () => onNavigateTab ? onNavigateTab('dashboard') : setActiveTab('dashboard') },
              { label: 'Skill Benchmarks & Gap Analysis', isCurrent: true }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {userSkills.length} Profile Skills Registered
        </span>
      </div>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="w-6 h-6 text-indigo-300" />
            <span>Skill Analyzer & Gap Diagnostic Engine</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Target Career Goal: <strong className="text-white">{targetGoal}</strong>. Identify skill gaps and get direct course recommendations.
          </p>
        </div>

        <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300 backdrop-blur-md">
          Target Match Score: 82%
        </div>
      </div>

      {/* Grid: Skill Gaps vs Added Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Target Career Requirements & Gaps */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-300" />
            <h2 className="text-base font-bold text-white">Target Career Benchmark Requirements</h2>
          </div>

          <div className="space-y-4">
            {targetSkillRequirements.map(req => {
              const matched = userSkills.find(s => s.skillName.toLowerCase().includes(req.name.toLowerCase()));
              const currentScore = matched ? matched.score : 0;
              const hasGap = currentScore < req.reqScore;

              return (
                <div key={req.name} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{req.name}</span>
                    <span className={`font-bold ${hasGap ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {currentScore}% / {req.reqScore}% Target
                    </span>
                  </div>

                  <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${hasGap ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, currentScore)}%` }}
                    />
                  </div>

                  {hasGap && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-amber-300 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Skill Gap Detected: +{req.reqScore - currentScore}% needed</span>
                      </span>
                      <button
                        onClick={() => setActiveTab('courses')}
                        className="text-indigo-300 hover:text-indigo-200 font-semibold"
                      >
                        Recommended Course
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: User Skills & Add Skill Form */}
        <div className="space-y-6">
          
          {/* Add Skill Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h3 className="text-sm font-bold text-white">Add or Update My Skills</h3>
            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Skill Name</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  placeholder="e.g. Dynamic Programming or React.js"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Proficiency Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-xs text-white focus:outline-none backdrop-blur-md"
                  >
                    <option value="Beginner" className="bg-slate-900">Beginner</option>
                    <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                    <option value="Advanced" className="bg-slate-900">Advanced</option>
                    <option value="Expert" className="bg-slate-900">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">Skill Score ({newSkillScore}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newSkillScore}
                    onChange={e => setNewSkillScore(Number(e.target.value))}
                    className="w-full mt-2 accent-indigo-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-1 backdrop-blur-md"
              >
                <Plus className="w-4 h-4" />
                <span>Save Skill Entry</span>
              </button>
            </form>
          </div>

          {/* User Skills List */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h3 className="text-sm font-bold text-white">Current Verified Skills</h3>
            <div className="space-y-3">
              {userSkills.map(sk => (
                <div key={sk.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-md">
                  <div>
                    <h4 className="text-xs font-bold text-white">{sk.skillName}</h4>
                    <span className="text-[10px] font-medium text-slate-300">{sk.level}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full backdrop-blur-md">
                    {sk.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
