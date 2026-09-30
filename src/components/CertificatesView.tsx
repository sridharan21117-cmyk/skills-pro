import React, { useState } from 'react';
import { Award, ShieldCheck, Download, Printer, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Certificate } from '../types';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface CertificatesViewProps {
  certificates: Certificate[];
  onNavigateTab?: (tab: string) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ certificates, onNavigateTab }) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Navigation Bar */}
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
              { label: 'Verified Certificates', isCurrent: !selectedCert }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {certificates.length} Earned Credentials
        </span>
      </div>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-300" />
            <span>Verified Credentials & Certificates</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">Cryptographically verifiable course completion records with unique code hashing.</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="p-12 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 backdrop-blur-md shadow-xl">
          <p className="text-xs text-slate-300">No certificates earned yet. Complete all lessons in a course to claim your certificate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div
              key={cert.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all backdrop-blur-md shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    VERIFIED CERTIFICATE
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{cert.courseTitle}</h3>
                  <p className="text-xs text-slate-300">Issued to: <strong className="text-white">{cert.userName}</strong></p>
                </div>
                <Award className="w-8 h-8 text-amber-300" />
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-mono space-y-1 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 block">Verification Code:</span>
                <span className="text-indigo-300 font-bold">{cert.verificationCode}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
                <span>Issue Date: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white font-bold rounded-xl transition shadow-lg backdrop-blur-md"
                >
                  View Full Credential
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-2xl p-8 shadow-2xl space-y-6 relative backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <BackButton
                  label="Back to Certificates"
                  onClick={() => setSelectedCert(null)}
                />
                <Breadcrumbs
                  items={[
                    { label: 'Certificates', onClick: () => setSelectedCert(null) },
                    { label: selectedCert.courseTitle, isCurrent: true }
                  ]}
                />
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Frame Display */}
            <div className="p-8 bg-white/5 border-4 border-amber-400/30 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-8 h-8 text-amber-300" />
                <h2 className="text-xl font-extrabold text-white tracking-widest uppercase">SKILL FORGE ACADEMY</h2>
              </div>

              <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Certificate of Mastery & Completion</p>

              <div className="space-y-1">
                <p className="text-xs text-slate-300">This is proudly presented to</p>
                <h1 className="text-2xl font-black text-white underline decoration-amber-400/50 underline-offset-8">{selectedCert.userName}</h1>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                For successfully fulfilling all academic curriculum requirements and demonstrating mastery in <strong className="text-white">{selectedCert.courseTitle}</strong>.
              </p>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div>
                  <span className="block text-[10px] text-slate-400">Issued On</span>
                  <span className="font-bold text-white">{new Date(selectedCert.issuedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Verification ID</span>
                  <span className="font-mono font-bold text-amber-300">{selectedCert.verificationCode}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 backdrop-blur-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
