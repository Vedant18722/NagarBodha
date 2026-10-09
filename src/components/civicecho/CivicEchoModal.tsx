/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CityInfo, SignalCategory } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { AlertTriangle, MapPin, Camera, Mic, X, CheckCircle } from 'lucide-react';

interface CivicEchoModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityInfo;
  onSubmitReport: (reportData: {
    cityId: string;
    category: SignalCategory;
    title: string;
    description: string;
    lat: number;
    lng: number;
    locationName?: string;
    reportedBy?: string;
    photoUrl?: string;
  }) => Promise<boolean>;
  onStartPickLocation: () => void;
  pickedCoordinates: { lat: number; lng: number } | null;
}

export const CivicEchoModal: React.FC<CivicEchoModalProps> = ({
  isOpen,
  onClose,
  city,
  onSubmitReport,
  onStartPickLocation,
  pickedCoordinates
}) => {
  const { t, tDual } = useTranslation();
  const [category, setCategory] = useState<SignalCategory>('construction_hazard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasVoiceNote, setHasVoiceNote] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Only image files (PNG, JPG, WebP) are allowed.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setValidationError('Image file size must be under 3MB.');
      return;
    }

    setValidationError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || description.length < 10) {
      setValidationError('Please provide a descriptive report of at least 10 characters.');
      return;
    }

    const targetLat = pickedCoordinates?.lat ?? city.lat;
    const targetLng = pickedCoordinates?.lng ?? city.lng;

    setIsSubmitting(true);
    setValidationError(null);

    const success = await onSubmitReport({
      cityId: city.id,
      category,
      title: title.trim() || category.replace('_', ' ').toUpperCase(),
      description: description.trim(),
      lat: targetLat,
      lng: targetLng,
      locationName: locationName.trim() || `${city.name} Central Zone`,
      reportedBy: reportedBy.trim() || 'Anonymous Resident',
      photoUrl: photoPreview || undefined
    });

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setTitle('');
      setDescription('');
      setLocationName('');
      setPhotoPreview(null);
      setHasVoiceNote(false);
      onClose();
    } else {
      setValidationError('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {tDual('report_local_signal').primary}
                {tDual('report_local_signal').secondary && (
                  <span className="text-xs text-cyan-400 font-devanagari ml-2 font-normal">
                    ({tDual('report_local_signal').secondary})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {t('civicecho_subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-rose-950/50 border border-rose-600/70 rounded-lg text-xs text-rose-300">
              {validationError}
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {t('signal_category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SignalCategory)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="construction_hazard">🚧 Sidewalk Construction / Curb Obstacle</option>
              <option value="lighting_outage">💡 Streetlight Outage / Dark Corridor</option>
              <option value="waterlogging">💧 Waterlogging / Deep Pothole</option>
              <option value="transit_delay">🚌 Public Transit Delay / Lift Maintenance</option>
              <option value="heavy_crowd">👥 Heavy Pedestrian Density / Gathering</option>
              <option value="quiet_zone">🤫 Quiet Study Haven / Calm Acoustic Zone</option>
            </select>
          </div>

          {/* Signal Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {t('short_title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. North sidewalk closed for gas pipe repairs"
              maxLength={80}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {t('observation_details')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed, exact obstruction, and if wheelchair ramps are affected..."
              rows={3}
              maxLength={400}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Map Location Picker */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Geographic Anchor</span>
              <button
                type="button"
                onClick={() => {
                  onStartPickLocation();
                  onClose();
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Tap Map to Pin Exact Spot</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              {pickedCoordinates ? (
                <span className="text-emerald-400">
                  Custom Pin Set: [{pickedCoordinates.lat.toFixed(4)}, {pickedCoordinates.lng.toFixed(4)}]
                </span>
              ) : (
                <span>Defaulted to {city.name} Central Coordinates</span>
              )}
            </div>

            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Intersection or Landmark Name (e.g. Boylston & Dartmouth)"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          {/* Attachments: Photo and Voice Note */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Photo Attachment */}
            <div>
              <label className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg cursor-pointer text-xs text-slate-300 transition-colors">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>{photoPreview ? t('change_photo') : t('attach_photo')}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3 h-3" /> Image attached (&lt;3MB)
                </div>
              )}
            </div>

            {/* Voice Note Simulator */}
            <div>
              <button
                type="button"
                onClick={() => setHasVoiceNote(!hasVoiceNote)}
                className={`w-full flex items-center justify-center gap-1.5 p-2.5 border rounded-lg text-xs transition-colors ${
                  hasVoiceNote
                    ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{hasVoiceNote ? t('voice_note_added') : t('add_voice_note')}</span>
              </button>
            </div>
          </div>

          {/* Submitter Name */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {t('your_name')}
            </label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="e.g. Student Commuter / Local Resident"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting & Classifying...' : t('submit_signal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
