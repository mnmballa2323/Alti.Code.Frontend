"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);

  // Custom Modal State for Unified Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Saved Cards State
  interface SavedCard {
    id: string;
    cardholderName: string;
    brand: string;
    last4: string;
    expiry: string;
    isPrimary: boolean;
  }

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: "card-1",
      cardholderName: "Ada Lovelace",
      brand: "Visa",
      last4: "4242",
      expiry: "12/27",
      isPrimary: true,
    },
    {
      id: "card-2",
      cardholderName: "Alan Turing",
      brand: "Mastercard",
      last4: "8888",
      expiry: "09/28",
      isPrimary: false,
    },
    {
      id: "card-3",
      cardholderName: "Grace Hopper",
      brand: "Amex",
      last4: "1007",
      expiry: "03/29",
      isPrimary: false,
    },
  ]);

  const detectBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("5")) return "Mastercard";
    if (clean.startsWith("3")) return "Amex";
    return "Card";
  };

  const getLast4 = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    return clean.slice(-4) || "0000";
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !cardholderName.trim() ||
      !cardNumber.trim() ||
      !expiry.trim() ||
      !cvc.trim()
    ) {
      setModalTitle("Card Details Required");
      setModalMessage("Please fill in all credit card details to proceed.");
      setModalOpen(true);

      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      const newCard: SavedCard = {
        id: `card-${Date.now()}`,
        cardholderName: cardholderName.trim(),
        brand: detectBrand(cardNumber),
        last4: getLast4(cardNumber),
        expiry: expiry.trim(),
        isPrimary: savedCards.length === 0, // Make primary if it's the first card
      };

      setSavedCards((prev) => [...prev, newCard]);

      // Reset form fields
      setCardholderName("");
      setCardNumber("");
      setExpiry("");
      setCvc("");

      setModalTitle("Card Added");
      setModalMessage("Your card details have been successfully added to your account!");
      setModalOpen(true);
    }, 1000);
  };

  const handleSetPrimary = (id: string) => {
    setSavedCards((prev) =>
      prev.map((card) => ({
        ...card,
        isPrimary: card.id === id,
      }))
    );
  };

  const handleRemoveCard = (id: string) => {
    setSavedCards((prev) => prev.filter((card) => card.id !== id));
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6 space-y-10">
      <form className="space-y-6" onSubmit={handleSaveCard}>
        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Cardholder Name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Card Number"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Expiry Date (MM/YY)"
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="CVC"
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
          />
        </div>

        {/* Footer: Action Button */}
        <div className="pt-4">
          <button
            className="w-full h-10 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-white text-white dark:text-neutral-950 font-semibold rounded-xl text-sm transition-all shadow-md shadow-neutral-800/10 flex items-center justify-center gap-2"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Card"
            )}
          </button>
        </div>
      </form>

      {/* Saved Cards Section */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              Cards on File
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Manage your payment methods and default billing card.
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
            {savedCards.length} {savedCards.length === 1 ? "card" : "cards"}
          </span>
        </div>

        {savedCards.length > 0 ? (
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/40 dark:border-neutral-800/60 rounded-xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
              <div className="col-span-4">Card / Brand</div>
              <div className="col-span-3">Cardholder Name</div>
              <div className="col-span-2">Expires</div>
              <div className="col-span-3 flex justify-end pr-2">Actions</div>
            </div>

            {/* List */}
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div className="col-span-4 flex items-center gap-3">
                  {/* Brand Icon or Tag */}
                  <span className={`px-2 py-1 text-[10px] font-extrabold tracking-wider rounded border ${
                    card.brand === "Visa"
                      ? "bg-blue-50/60 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30 text-blue-600 dark:text-blue-400"
                      : card.brand === "Mastercard"
                      ? "bg-orange-50/60 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/30 text-orange-600 dark:text-orange-400"
                      : card.brand === "Amex"
                      ? "bg-cyan-50/60 dark:bg-cyan-900/10 border-cyan-200/50 dark:border-cyan-800/30 text-cyan-600 dark:text-cyan-400"
                      : "bg-neutral-50/60 dark:bg-neutral-900/10 border-neutral-200/50 dark:border-neutral-800/30 text-neutral-600 dark:text-neutral-400"
                  }`}>
                    {card.brand.toUpperCase()}
                  </span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 font-medium">
                    •••• {card.last4}
                  </span>
                  {card.isPrimary && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-md">
                      Primary
                    </span>
                  )}
                </div>

                <div className="col-span-3 text-neutral-850 dark:text-neutral-300 font-medium truncate">
                  {card.cardholderName}
                </div>

                <div className="col-span-2 text-neutral-500 dark:text-neutral-400 font-medium">
                  {card.expiry}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2">
                  {!card.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(card.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-neutral-550 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border cursor-pointer ${
                      card.isPrimary
                        ? "text-neutral-350 dark:text-neutral-600 border-neutral-100 dark:border-neutral-850 cursor-not-allowed"
                        : "text-red-500 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/15 border-neutral-200 dark:border-neutral-800 hover:border-red-200 dark:hover:border-red-900/40"
                    }`}
                    disabled={card.isPrimary}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
            No saved cards on file. Add a card above to get started.
          </div>
        )}
      </div>

      {/* Custom Unified Notification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[380px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                {modalTitle}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-4 leading-normal">
                {modalMessage}
              </p>
            </div>
            
            {/* Horizontal border line */}
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
            
            {/* Footer Button Split */}
            <div className="flex w-full">
              <button
                className="flex-1 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none cursor-pointer"
                onClick={() => setModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
