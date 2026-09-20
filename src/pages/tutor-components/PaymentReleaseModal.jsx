import React from "react";
import {
  CheckCircle2,
  Copy,
  Loader2,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import {
  formatCurrency,
} from "./tutorPayments.utils";

const ModalRow = ({
  label,
  value,
  valueClass = "text-slate-800",
}) => (
  <div className="grid grid-cols-[110px_1fr] items-start gap-3 text-xs">
    <span className="font-semibold text-slate-500">
      {label}
    </span>

    <span
      className={`break-words font-extrabold ${valueClass}`}
    >
      {value || "—"}
    </span>
  </div>
);

const PaymentReleaseModal = ({
  selectedPayment,
  updatingPayment,
  onClose,
  onRelease,
  copyUPI,
}) => {
  if (!selectedPayment) {
    return null;
  }

  const canGeneratePaymentQR = Boolean(
    selectedPayment.tutorUPI &&
      selectedPayment.taskID &&
      Number(
        selectedPayment.tutorAmount
      ) > 0
  );

  const paymentUPIValue =
    canGeneratePaymentQR
      ? `upi://pay?pa=${encodeURIComponent(
          selectedPayment.tutorUPI
        )}&pn=${encodeURIComponent(
          selectedPayment.tutorName ||
            "BrandName Tutor"
        )}&am=${Number(
          selectedPayment.tutorAmount
        )}&cu=INR&tn=${encodeURIComponent(
          `${selectedPayment.taskID} | ${selectedPayment.subject}`
        )}`
      : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Release Payment
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Verify the payment details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <ModalRow
              label="Task ID"
              value={
                selectedPayment.taskID
              }
            />

            <ModalRow
              label="Brand"
              value={
                selectedPayment.brand
              }
            />

            <ModalRow
              label="Tutor ID"
              value={
                selectedPayment.tutorID
              }
            />

            <ModalRow
              label="Tutor Amount"
              value={formatCurrency(
                selectedPayment.tutorAmount
              )}
              valueClass="text-indigo-600"
            />
          </div>

          <div className="py-5 text-center">
            <p className="mb-3 text-xs font-extrabold text-slate-600">
              Scan & Pay via UPI
            </p>

            {canGeneratePaymentQR ? (
              <div className="mx-auto flex w-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <QRCodeSVG
                  value={paymentUPIValue}
                  size={170}
                  level="H"
                  includeMargin={false}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-5 text-center">
                <p className="text-xs font-extrabold text-rose-700">
                  Payment QR cannot be
                  generated.
                </p>

                <p className="mt-1 text-[11px] font-medium text-rose-600">
                  Tutor UPI ID, amount, or
                  Task ID is missing.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <ModalRow
              label="Amount"
              value={formatCurrency(
                selectedPayment.tutorAmount
              )}
            />

            <ModalRow
              label="Description"
              value={`${selectedPayment.taskID} | ${selectedPayment.subject}`}
            />

            <ModalRow
              label="UPI ID"
              value={
                selectedPayment.tutorUPI
              }
            />

            <button
              type="button"
              onClick={copyUPI}
              disabled={
                !selectedPayment.tutorUPI
              }
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-extrabold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy size={15} />
              Copy UPI ID
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updatingPayment}
              className="h-10 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onRelease}
              disabled={
                updatingPayment ||
                !canGeneratePaymentQR
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingPayment ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 size={15} />
              )}

              Mark as Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReleaseModal;
