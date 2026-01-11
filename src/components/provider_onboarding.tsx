import { useState } from "react";
import { MultiSelect, Option } from "components/multi_select";

interface ProviderOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  allProviderOptions: Option[];
  onSaveProviders: (selected: Option[]) => void;
}

export const ProviderOnboarding: React.FC<ProviderOnboardingProps> = ({
  isOpen,
  onClose,
  allProviderOptions,
  onSaveProviders,
}) => {
  const [selectedProviders, setSelectedProviders] = useState<Option[]>([]);

  if (!isOpen) return null;

  const handleContinue = () => {
    onSaveProviders(selectedProviders);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              Welcome to Watchlist!
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">
              Select your streaming services to see which movies and shows you
              can watch right now. You can always change this later.
            </p>
          </div>

          {/* Provider Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Your Streaming Services
            </label>
            <MultiSelect
              selected={selectedProviders}
              options={allProviderOptions}
              setSelected={setSelectedProviders}
              label="Select Providers"
            />
            <p className="text-text-tertiary text-xs mt-2">
              {selectedProviders.length === 0
                ? "Select at least one streaming service to get started"
                : `${selectedProviders.length} service${selectedProviders.length === 1 ? "" : "s"} selected`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary transition-all font-medium active:scale-95"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={selectedProviders.length === 0}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600 active:scale-95"
            >
              {selectedProviders.length === 0
                ? "Select providers to continue"
                : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
