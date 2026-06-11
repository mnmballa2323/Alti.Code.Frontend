"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

// CardLogo component rendering the actual official badge logo for each card network from local assets
const CardLogo = ({ brand }: { brand: string }) => {
  const brandLower = brand.toLowerCase();
  let logoPath = "";

  switch (brandLower) {
    case "visa":
      logoPath = "/assets/cards/visa.svg";
      break;
    case "mastercard":
      logoPath = "/assets/cards/mastercard.svg";
      break;
    case "amex":
    case "american express":
      logoPath = "/assets/cards/amex.svg";
      break;
    case "discover":
      logoPath = "/assets/cards/discover.svg";
      break;
    case "diners":
    case "diners club":
      logoPath = "/assets/cards/diners.svg";
      break;
    case "jcb":
      logoPath = "/assets/cards/jcb.svg";
      break;
    case "unionpay":
      logoPath = "/assets/cards/unionpay.svg";
      break;
    case "elo":
      logoPath = "/assets/cards/elo.svg";
      break;
    case "maestro":
      logoPath = "/assets/cards/maestro.svg";
      break;
    default:
      return (
        <div className="w-10 h-6.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center select-none shrink-0">
          <svg viewBox="0 0 32 20" className="w-6 h-4 text-neutral-400 dark:text-neutral-500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="20" rx="4" fill="currentColor" fillOpacity="0.1" />
            <rect x="4" y="4" width="7" height="4.5" rx="0.5" fill="currentColor" fillOpacity="0.4" />
            <line x1="4" y1="12.5" x2="28" y2="12.5" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
          </svg>
        </div>
      );
  }

  return (
    <div className="w-10 h-6.5 rounded-md overflow-hidden bg-white border border-neutral-200/50 dark:border-neutral-800/80 flex items-center justify-center select-none shrink-0 shadow-sm">
      <img
        src={logoPath}
        alt={`${brand} logo`}
        className="w-full h-full object-contain p-0.5"
      />
    </div>
  );
};

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
    {
      id: "card-4",
      cardholderName: "Margaret Hamilton",
      brand: "Discover",
      last4: "2468",
      expiry: "06/28",
      isPrimary: false,
    },
    {
      id: "card-5",
      cardholderName: "Hedy Lamarr",
      brand: "JCB",
      last4: "3580",
      expiry: "11/27",
      isPrimary: false,
    },
    {
      id: "card-6",
      cardholderName: "Katherine Johnson",
      brand: "UnionPay",
      last4: "6217",
      expiry: "08/30",
      isPrimary: false,
    },
    {
      id: "card-7",
      cardholderName: "Dorothy Vaughan",
      brand: "Elo",
      last4: "5066",
      expiry: "04/29",
      isPrimary: false,
    },
  ]);

  const detectBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (/^4/.test(clean)) return "Visa";
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "Amex";
    if (/^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5])|64[4-9]|65)/.test(clean)) return "Discover";
    if (/^36/.test(clean) || /^30[0-5]/.test(clean) || /^38/.test(clean)) return "Diners Club";
    if (/^35(2[8-9]|[3-8][0-9])/.test(clean)) return "JCB";
    if (/^(62|81)/.test(clean)) return "UnionPay";
    if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(clean)) return "Maestro";
    if (/^(4011|4312|4389|4514|4573|4576|5041|5066|5090|6277|6362|6363|6503|6504|6505|6506|6507|6508|6509|6510|6511|6512|6513|6514|6515|6516)/.test(clean)) return "Elo";
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
    const card = savedCards.find((c) => c.id === id);
    if (card?.isPrimary) {
      setModalTitle("Primary Card");
      setModalMessage("You cannot remove your primary payment method. Please set another card as primary first.");
      setModalOpen(true);

      return;
    }
    setSavedCards((prev) => prev.filter((card) => card.id !== id));
  };

  const sortedCards = [...savedCards].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

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
      <div className="space-y-3">
        {savedCards.length > 0 ? (
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase shadow-sm">
              <div className="col-span-4">Card Brand</div>
              <div className="col-span-3">Cardholder Name</div>
              <div className="col-span-2">Expires</div>
              <div className="col-span-3 flex justify-end pr-2">Actions</div>
            </div>

            {/* List */}
            {sortedCards.map((card) => (
              <div
                key={card.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <CardLogo brand={card.brand} />
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
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border cursor-pointer text-red-500 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/15 border-neutral-200 dark:border-neutral-800 hover:border-red-200 dark:hover:border-red-900/40"
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
