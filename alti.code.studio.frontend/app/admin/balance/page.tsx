"use client";

import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, RefreshCw } from "lucide-react";

export default function BalancePage() {
  const currentBalance = 4250.00;
  const [isAutoRechargeEnabled, setIsAutoRechargeEnabled] = React.useState(true);
  const [isAutoRechargeOpen, setIsAutoRechargeOpen] = React.useState(false);
  const [modalAutoRechargeEnabled, setModalAutoRechargeEnabled] = React.useState(true);
  const [autoRechargeThreshold, setAutoRechargeThreshold] = React.useState<string>("");
  const [autoRechargeAmount, setAutoRechargeAmount] = React.useState<string>("");
  const [isThresholdFocused, setIsThresholdFocused] = React.useState(false);
  const [isRechargeFocused, setIsRechargeFocused] = React.useState(false);
  
  const [isAddFundsOpen, setIsAddFundsOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<number | null>(100);
  const [customAmount, setCustomAmount] = React.useState<string>("");
  const [isCustomAmountFocused, setIsCustomAmountFocused] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (isAddFundsOpen) {
      setSelectedPreset(100);
      setCustomAmount("");
    }
  }, [isAddFundsOpen]);

  React.useEffect(() => {
    if (isAutoRechargeOpen) {
      setModalAutoRechargeEnabled(isAutoRechargeEnabled);
      setIsThresholdFocused(false);
      setIsRechargeFocused(false);
    }
  }, [isAutoRechargeOpen, isAutoRechargeEnabled]);

  const finalAmount = customAmount ? Number(customAmount) : (selectedPreset || 0);

  const handleAddFunds = () => {
    setIsProcessing(true);
    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsAddFundsOpen(false);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Balance Card */}
        <div className="bg-black rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-neutral-800">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="text-5xl md:text-7xl font-black tracking-tighter">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-zinc-400 text-sm">
                Low balance auto-recharge is{" "}
                {isAutoRechargeEnabled ? (
                  <span className="text-emerald-400 font-medium">enabled</span>
                ) : (
                  <span className="text-red-400 font-medium">disabled</span>
                )}
                .
              </p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button 
                onClick={() => setIsAddFundsOpen(true)}
                className="w-full bg-white hover:bg-zinc-100 text-black py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Funds
              </button>
              <button 
                onClick={() => setIsAutoRechargeOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Auto-Recharge
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Add Funds Modal */}
      {isAddFundsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddFundsOpen(false);
          }}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">Add Funds</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedPreset(amount);
                    setCustomAmount("");
                  }}
                  className={`py-3 rounded-xl font-bold text-lg transition-colors border ${
                    selectedPreset === amount
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="relative">
                {(isCustomAmountFocused || customAmount) && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white font-bold text-lg">$</span>
                )}
                <input 
                  type="text" 
                  placeholder={isCustomAmountFocused ? "" : "Enter Custom Amount"}
                  value={customAmount ? Number(customAmount).toLocaleString() : ""}
                  onFocus={() => setIsCustomAmountFocused(true)}
                  onBlur={() => setIsCustomAmountFocused(false)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setCustomAmount(raw);
                    if (raw) setSelectedPreset(null);
                  }}
                  className={`w-full h-12 pr-4 rounded-xl border border-transparent bg-neutral-100 dark:bg-neutral-800 font-bold text-lg placeholder:font-normal placeholder:text-sm focus:outline-none transition-all ${isCustomAmountFocused || customAmount ? 'pl-8' : 'pl-4'}`}
                />
              </div>
            </div>



            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddFundsOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddFunds}
                disabled={isProcessing || finalAmount === 0}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? "Processing..." : `Pay $${finalAmount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Recharge Modal */}
      {isAutoRechargeOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAutoRechargeOpen(false);
          }}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-transparent">
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">Enable Auto-Recharge</p>
                <p className="text-xs text-neutral-500">Automatically add funds when balance is low</p>
              </div>
              <button 
                onClick={() => setModalAutoRechargeEnabled(!modalAutoRechargeEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modalAutoRechargeEnabled ? 'bg-black dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${modalAutoRechargeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`transition-opacity duration-300 ${modalAutoRechargeEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="mb-6">
                <div className="relative">
                  {(isThresholdFocused || autoRechargeThreshold) && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white font-bold text-lg">$</span>
                  )}
                  <input 
                    type="text" 
                    placeholder={isThresholdFocused ? "" : "Minimum Balance"}
                    value={autoRechargeThreshold ? Number(autoRechargeThreshold).toLocaleString() : ""}
                    onFocus={() => setIsThresholdFocused(true)}
                    onBlur={() => setIsThresholdFocused(false)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setAutoRechargeThreshold(raw);
                    }}
                    className={`w-full h-12 pr-4 rounded-xl border border-transparent bg-neutral-100 dark:bg-neutral-800 font-bold text-lg placeholder:font-normal placeholder:text-sm focus:outline-none transition-all ${isThresholdFocused || autoRechargeThreshold ? 'pl-8' : 'pl-4'}`}
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="relative">
                  {(isRechargeFocused || autoRechargeAmount) && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white font-bold text-lg">$</span>
                  )}
                  <input 
                    type="text" 
                    placeholder={isRechargeFocused ? "" : "Recharge Amount"}
                    value={autoRechargeAmount ? Number(autoRechargeAmount).toLocaleString() : ""}
                    onFocus={() => setIsRechargeFocused(true)}
                    onBlur={() => setIsRechargeFocused(false)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setAutoRechargeAmount(raw);
                    }}
                    className={`w-full h-12 pr-4 rounded-xl border border-transparent bg-neutral-100 dark:bg-neutral-800 font-bold text-lg placeholder:font-normal placeholder:text-sm focus:outline-none transition-all ${isRechargeFocused || autoRechargeAmount ? 'pl-8' : 'pl-4'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsAutoRechargeOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsAutoRechargeEnabled(modalAutoRechargeEnabled);
                  setIsAutoRechargeOpen(false);
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors flex items-center justify-center gap-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
