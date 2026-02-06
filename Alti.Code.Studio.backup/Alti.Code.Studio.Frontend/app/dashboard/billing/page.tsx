"use client";
import Subscription from "@/components/dashboard/dashboard-payment/subscription";
import DeleteModal from "@/components/delete";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useState } from "react";

function BillingPage() {
  const [isCardDetails, setCardDetails] = useState(true);
  const [isModel, setModel] = useState(false);
  const [isCardRemoving, setCardRemoving] = useState(false);

  const handleClose = () => {
    setCardRemoving(false);
  };

  const handleRemove = () => {
    setCardDetails(false);
    setCardRemoving(false);
  };

  const handleSubmit = () => {
    setModel(false);
    setCardDetails(true);
  };
  return (
    <div className="w-screen  p-10 h-screen">
      <h1 className="text-4xl font-[700] leading-[32px]">Billing</h1>
      <div className="mt-10">
        <h6 className="font-bold text-lg">Payment Methods</h6>
        <p className="opacity-60">Add your payment details for billing</p>

       
        <div className="mt-5 ">
          <div>
         
           {isCardDetails ? (
          <div className="flex items-center justify-between ">
            <div className="flex items-center ">
              <p className="text-lg font-semibold">Visa ending in 2255</p>
            </div>
            <Button
              className="bg-black text-white"
              onClick={() => {
                setCardRemoving(true);
              }}
            >
              Remove Card
            </Button>
          </div>
        ) : (
          <Button
            className="bg-black text-white mt-5"
            onClick={() => {
              setModel(true);
            }}
          >
            Add Card
          </Button>
        )}
          </div>
          <div className="grid grid-cols-3 mt-5 py-2.5 px-2 bg-default-100 mb-2">
            <p className="flex items-center">Date</p>
            <p className="flex items-center">Type</p>
            <p className="">Receipt</p>
          </div>
          <div
            className={`overflow-y-auto ${isCardDetails ? "h-[calc(100vh_-_410px)]" : "h-[calc(100vh_-_404px)]"}`}
          >
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-3 py-1 bg-default-100 px-2 mb-2"
              >
                <p className="flex items-center">Oct, 21, 2021</p>
                <p className="flex items-center">Pro Annual</p>
                <Link
                  className="text-black w-fit underline hover:opacity-60 transition-all duration-200 ease-in-out"
                  href="/assets/pdf/dummy.pdf"
                  download
                >
                  Download
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isModel && (
        <div className="absolute right-0 top-0 h-screen w-screen flex items-center justify-center bg-black/50">
          <div className="bg-white px-7  h-fit overflow-y-auto rounded-2xl transition-all ease-in-out duration-200">
            <Subscription submit={handleSubmit} />
          </div>
        </div>
      )}
      {isCardRemoving && (
        <DeleteModal
          title="payment method"
          onClose={handleClose}
          onLogout={handleRemove}
          isOpen={isCardRemoving}
        />
      )}
    </div>
  );
}

export default BillingPage;
