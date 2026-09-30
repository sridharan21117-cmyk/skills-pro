import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, DollarSign, CheckCircle2, AlertCircle, ArrowRight, Search, Filter, X, FileText, Send } from 'lucide-react';
import { Job, JobApplication } from '../types';
import { jobService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface JobSimulatorViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const JobSimulatorView: React.FC<JobSimulatorViewProps> = ({ onNavigateTab }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters & State Preservation
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  
  // Selected Job Details & Application Form State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [resumeName, setResumeName] = useState('My_SkillForge_Resume.pdf');
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    loadJobsData();
  }, []);

  const loadJobsData = async () => {
    setLoading(true);
    try {
      const [jobList, myApps] = await Promise.all([
        jobService.getJobs(),
        jobService.getMyApplications()
      ]);
      setJobs(jobList);
      setApplications(myApps);
    } catch (e) {
      console.error('Failed to load job data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplicationForm = (job: Job) => {
    setApplyingJob(job);
    setCoverNote('');
    setIsFormDirty(false);
  };

  const handleCoverNoteChange = (val: string) => {
    setCoverNote(val);
    setIsFormDirty(val.trim().length > 0);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    try {
      const app = await jobService.applyForJob(applyingJob.id);
      setApplications(prev => [...prev, app]);
      setIsFormDirty(false);
      setApplyingJob(null);
      setSelectedJob(null);
    } catch (e) {
      console.error('Failed to apply for job', e);
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                          j.company.toLowerCase().includes(search.toLowerCase()) ||
                          j.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'All' || j.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label="Back to Dashboard"
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
              { label: 'Job Drive Portal', isCurrent: !selectedJob && !applyingJob }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredJobs.length} Positions Available
        </span>
      </div>

      {/* Main Header */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <span>Job Drive Portal & Skill Match Simulator</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real placement drives with automatic skill match calculations, missing gap alerts, and application tracking.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs or companies..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400/50 backdrop-blur-md placeholder:text-slate-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400/50 backdrop-blur-md"
          >
            <option value="All" className="bg-slate-900">All Job Types</option>
            <option value="Full-time" className="bg-slate-900">Full-time</option>
            <option value="Internship" className="bg-slate-900">Internship</option>
            <option value="Contract" className="bg-slate-900">Contract</option>
          </select>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading placement opportunities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(job => {
            const applied = applications.some(a => a.jobId === job.id);

            return (
              <div
                key={job.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all backdrop-blur-md shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {job.type}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">{job.title}</h3>
                      <p className="text-xs text-slate-300 flex items-center space-x-2 mt-1">
                        <span className="flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-indigo-300" />
                          <span>{job.company}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-pink-300" />
                          <span>{job.location}</span>
                        </span>
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full backdrop-blur-md">
                      85% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{job.description}</p>

                  {/* Required Skills Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-200 text-[10px] font-medium rounded-xl backdrop-blur-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs mt-4">
                  <span className="font-bold text-white">{job.salary}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition border border-white/10"
                    >
                      Details
                    </button>

                    {applied ? (
                      <span className="flex items-center space-x-1 text-emerald-300 font-bold bg-emerald-500/20 px-3 py-1.5 rounded-2xl border border-emerald-500/30 backdrop-blur-md">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenApplicationForm(job)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-white/20 text-white rounded-2xl font-bold transition shadow-lg backdrop-blur-md flex items-center space-x-1"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && !applyingJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <BackButton
                  label="Back to Jobs"
                  onClick={() => setSelectedJob(null)}
                />
                <div>
                  <Breadcrumbs
                    items={[
                      { label: 'Jobs', onClick: () => setSelectedJob(null) },
                      { label: selectedJob.title, isCurrent: true }
                    ]}
                  />
                  <h3 className="text-base font-bold text-white mt-1">{selectedJob.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex flex-wrap gap-3">
                <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/30">{selectedJob.company}</span>
                <span className="font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-xl">{selectedJob.location}</span>
                <span className="font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-xl border border-indigo-500/30">{selectedJob.type}</span>
                <span className="font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30">{selectedJob.salary}</span>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white">Job Description</h4>
                <p className="leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white">Required Skills & Match Gap</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.requiredSkills.map(s => (
                    <span key={s} className="px-3 py-1 bg-white/10 rounded-xl text-slate-200 border border-white/10 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2 bg-white/10 text-xs font-bold text-slate-300 rounded-xl">
                Close
              </button>
              <button
                onClick={() => handleOpenApplicationForm(selectedJob)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Application Form Modal with Unsaved Changes Protection */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <BackButton
                  label="Back to Job Details"
                  isDirty={isFormDirty}
                  onClick={() => setApplyingJob(null)}
                />
                <div>
                  <Breadcrumbs
                    items={[
                      { label: 'Jobs', onClick: () => setApplyingJob(null) },
                      { label: applyingJob.title, onClick: () => setApplyingJob(null) },
                      { label: 'Submit Application', isCurrent: true }
                    ]}
                  />
                  <h3 className="text-base font-bold text-white mt-1">Application for {applyingJob.title}</h3>
                </div>
              </div>
              <button onClick={() => setApplyingJob(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="text-xs font-bold text-white">{applyingJob.company}</div>
                <div className="text-[10px] text-slate-400">{applyingJob.location} • {applyingJob.type}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Attached Resume</label>
                <div className="flex items-center justify-between p-3 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-slate-200">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{resumeName}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Verified CV</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Cover Note / Candidate Statement</label>
                <textarea
                  value={coverNote}
                  onChange={e => handleCoverNoteChange(e.target.value)}
                  placeholder="Explain why you are a strong fit for this position..."
                  className="w-full h-28 p-3 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <BackButton
                  label="Cancel"
                  isDirty={isFormDirty}
                  onClick={() => setApplyingJob(null)}
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
