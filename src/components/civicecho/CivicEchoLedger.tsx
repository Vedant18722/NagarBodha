/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CivicReport, CityInfo, VerificationStatus } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { AlertTriangle, ThumbsUp, MapPin, Plus, CheckCircle2, Clock, Camera, Mic } from 'lucide-react';

interface CivicEchoLedgerProps {
  reports: CivicReport[];
  city: CityInfo;
  onCorroborate: (reportId: string) => void;
  onOpenReportModal: () => void;
  onFocusReportOnMap: (report: CivicReport) => void;
}

export const CivicEchoLedger: React.FC<CivicEchoLedgerProps> = ({
  reports,
  city,
  onCorroborate,
  onOpenReportModal,
  onFocusReportOnMap
}) => {
  const { t, tDual } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-sans">
              {tDual('civicecho_title').primary}
              {tDual('civicecho_title').secondary && (
                <span className="text-xs text-cyan-400 font-devanagari ml-2 font-normal">
                  ({tDual('civicecho_title').secondary})
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('civicecho_subtitle')}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('report_new_signal')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white border-slate-600'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {t('all_signals')} ({reports.length})
        </button>
        <button
          onClick={() => setStatusFilter('corroborated')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
            statusFilter === 'corroborated'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {t('corroborated')} ({reports.filter(r => r.status === 'corroborated').length})
        </button>
        <button
          onClick={() => setStatusFilter('unverified')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
            statusFilter === 'unverified'
              ? 'bg-amber-950/80 text-amber-300 border-amber-600'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {t('unverified')} ({reports.filter(r => r.status === 'unverified').length})
        </button>
        <button
          onClick={() => setStatusFilter('reviewed')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors border ${
            statusFilter === 'reviewed'
              ? 'bg-blue-950/80 text-blue-300 border-blue-600'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {t('reviewed')} ({reports.filter(r => r.status === 'reviewed').length})
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No active reports in this category</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Be the first to report a sidewalk obstruction or lighting outage in {city.name}.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isCorroborated = report.status === 'corroborated' || report.status === 'reviewed';

            return (
              <div
                key={report.id}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-sans">
                        {report.title}
                      </h3>
                      {/* Status Tag (Zero-pill clean text) */}
                      <span className={`text-[11px] font-mono font-semibold ${
                        report.status === 'reviewed' 
                          ? 'text-blue-400' 
                          : isCorroborated 
                            ? 'text-emerald-400' 
                            : 'text-amber-400'
                      }`}>
                        · {report.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{report.locationName}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Corroborate Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onFocusReportOnMap(report)}
                      className="px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-800/60 rounded-md"
                    >
                      {t('locate_on_map')}
                    </button>
                    <button
                      onClick={() => onCorroborate(report.id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono tabular-nums">{report.corroborations}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{t('confirm_corroborate')}</span>
                    </button>
                  </div>
                </div>

                {/* Description Text */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {report.description}
                </p>

                {/* AI Classification Note */}
                {report.aiClassificationNote && (
                  <div className="mt-2.5 p-2 bg-slate-900/60 border border-slate-800 rounded text-[11px] text-slate-400 font-mono">
                    <span className="text-cyan-400 font-semibold font-sans">{t('ai_mobility_assessment')}:</span> {report.aiClassificationNote}
                  </div>
                )}

                {/* Attachments Indicator & Attribution */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-3">
                    {report.hasPhoto && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Camera className="w-3 h-3 text-cyan-400" /> Photo Attached
                      </span>
                    )}
                    {report.hasAudio && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Mic className="w-3 h-3 text-amber-400" /> Voice Note
                      </span>
                    )}
                  </div>
                  <div>
                    {t('reported_by')}: <span className="text-slate-300 font-medium">{report.reportedBy}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
