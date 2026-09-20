import React from 'react';
import { Printer, Download, X, ShieldCheck, FileText, Store } from 'lucide-react';

export default function DocumentModal({ isOpen, onClose, title = 'Invoice Preview', type = 'invoice', data = {} }) {
  // Modal open na hoy toh kai j render na karo
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Action Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#4A5D23]" />
            <span className="font-bold text-sm text-[#2A2626] uppercase tracking-wider">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#2A2626] hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => alert(`Downloading official ${type} PDF...`)}
              className="px-3 py-1.5 rounded-lg bg-[#2A2626] text-white text-xs font-bold hover:bg-[#78716C] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm ml-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div className="p-6 sm:p-8 space-y-8 text-[#2A2626]">

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-[#4A5D23] tracking-tight">Rentora</h2>
              <p className="text-[11px] text-[#78716C] mt-1 font-medium">
                India's Multi-Vendor Rental Marketplace
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="text-lg font-extrabold text-[#2A2626]">{data.invoiceNumber || 'DOC-2026-9814'}</div>
              <div className="text-gray-500 font-medium">Date: {data.invoiceDate || '16 Sep 2026'}</div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 mt-1">
                Verified & Paid
              </div>
            </div>
          </div>

          {/* Parties Grid (Renter & Vendor) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-[#F5F4F0]/50 p-5 rounded-2xl border border-[#E7E5E4]/40">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78716C]">Billed To (Customer)</span>
              <div className="font-bold text-sm text-[#2A2626]">Vansh Patel</div>
              <div className="text-gray-600">Ranip, Ahmedabad, Gujarat</div>
              <div className="text-gray-600">+91 98765 43210</div>
              <div className="text-emerald-700 font-semibold mt-2 flex items-center gap-1 bg-emerald-50 w-max px-2 py-1 rounded-md">
                <ShieldCheck size={12} /> KYC Verified
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78716C]">Rented From (Vendor)</span>
              <div className="font-bold text-sm text-[#2A2626]">{data.vendor || 'Rentora Partner'}</div>
              <div className="text-gray-600">Ahmedabad Hub</div>
              <div className="text-gray-600">Verified Rental Partner</div>
              <div className="text-[#4A5D23] font-semibold mt-2 flex items-center gap-1 bg-[#4A5D23]/10 w-max px-2 py-1 rounded-md">
                <Store size={12} /> Escrow Protected
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[#78716C] uppercase text-[10px]">
                  <th className="py-3 font-extrabold">Item Description</th>
                  <th className="py-3 font-extrabold">Duration</th>
                  <th className="py-3 text-right font-extrabold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 font-bold text-sm">{data.product || 'Rental Equipment'}</td>
                  <td className="py-4 text-gray-600 font-medium">{data.duration || 'N/A'}</td>
                  <td className="py-4 text-right font-bold text-sm">₹{data.subtotal ? data.subtotal.toLocaleString('en-IN') : '0'}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600 font-medium">Refundable Security Deposit (Escrow)</td>
                  <td className="py-3 text-gray-600 text-[11px]">Held during rental</td>
                  <td className="py-3 text-right font-bold text-emerald-700">₹{data.deposit ? data.deposit.toLocaleString('en-IN') : '0'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Rental Cost:</span>
                <span className="font-bold text-gray-900">₹{data.subtotal ? data.subtotal.toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Deposit (Refundable):</span>
                <span className="font-bold">₹{data.deposit ? data.deposit.toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#2A2626] pt-3 border-t border-gray-200">
                <span>Total Paid:</span>
                <span className="text-[#4A5D23]">₹{data.total ? data.total.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-relaxed font-medium pb-4">
            This is a computer-generated digital invoice verified by Rentora Technologies. All deposits are held securely in Escrow and are governed by our standard terms of service.
          </div>

        </div>
      </div>
    </div>
  );
}