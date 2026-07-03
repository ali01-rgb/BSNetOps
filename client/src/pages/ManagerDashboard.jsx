import React from 'react';

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border shadow-sm border-amber-200">
          <h3 className="text-zinc-500 text-sm">Menunggu Approval</h3>
          <p className="text-4xl font-bold text-amber-600 mt-2">12 Request</p>
          <button className="mt-4 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Review Sekarang</button>
        </div>
        <div className="bg-white p-6 border shadow-sm">
          <h3 className="text-zinc-500 text-sm">Laporan Bulanan</h3>
          <p className="text-4xl font-bold text-zinc-900 mt-2">Juni 2026</p>
          <button className="mt-4 border border-zinc-300 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50">Download PDF</button>
        </div>
      </div>
    </div>
  );
}