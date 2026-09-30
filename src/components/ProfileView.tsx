import React, { useState } from 'react';
import { User as UserIcon, Mail, Building, GraduationCap, Phone, Target, Save, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { profileService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onNavigateTab }) => {
  const [name, setName] = useState(user.name);
  const [college, setCollege] = useState(user.college || 'PSG College of Technology');
  const [department, setDepartment] = useState(user.department || 'Computer Science & Engineering');
  const [phone, setPhone] = useState(user.phone || '+91 9876543210');
  const [careerGoal, setCareerGoal] = useState(user.careerGoal || 'Full Stack AI Software Engineer');
  const [bio, setBio] = useState(user.bio || 'Passionate software engineering learner focused on full-stack web and AI systems.');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setIsDirty(true);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updated = await profileService.updateProfile({
        name,
        college,
        department,
        phone,
        careerGoal,
        bio
      });
      onUpdateUser(updated);
      setSuccess(true);
      setIsDirty(false);
    } catch (e) {
      console.error('Failed to update profile', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label="Back to Dashboard"
            isDirty={isDirty}
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
              { label: 'Profile Settings', isCurrent: true }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {user.role} Account
        </span>
      </div>

      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400/50 shadow-xl"
          />
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-xs text-slate-300">{user.role} • {user.email}</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full backdrop-blur-md">
          Active Verified Learner
        </span>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center space-x-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile saved successfully!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Personal & Academic Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => handleFieldChange(setName, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => handleFieldChange(setPhone, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">College / Institution</label>
            <input
              type="text"
              value={college}
              onChange={e => handleFieldChange(setCollege, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => handleFieldChange(setDepartment, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">Target Career Goal</label>
            <input
              type="text"
              value={careerGoal}
              onChange={e => handleFieldChange(setCareerGoal, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">Bio Summary</label>
            <textarea
              value={bio}
              onChange={e => handleFieldChange(setBio, e.target.value)}
              className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
          <BackButton
            label="Cancel Changes"
            isDirty={isDirty}
            onClick={() => {
              setName(user.name);
              setCollege(user.college || '');
              setDepartment(user.department || '');
              setPhone(user.phone || '');
              setCareerGoal(user.careerGoal || '');
              setBio(user.bio || '');
              setIsDirty(false);
            }}
          />
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center space-x-2 backdrop-blur-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
