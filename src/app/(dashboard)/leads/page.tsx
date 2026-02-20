'use client';

import React, { useEffect, useState } from 'react';
import {
  PhoneIcon,
  UserIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LeadsProject, leadsprojectApi } from '@/api/leads.api';

const LeadsProjectPage = () => {
  const [leads, setLeads] = useState<LeadsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewLead, setViewLead] = useState<LeadsProject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsprojectApi.getAllLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Leads Project
        </h1>
        <p className="text-gray-600">
          Users who accessed project pages
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Count */}
      <div className="mb-6 flex justify-end">
        <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border">
          Total: {leads.length}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
          <div className="text-6xl mb-4 opacity-50">📞</div>
          <p className="text-gray-600">No leads yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border shadow-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead, i) => (
                <tr
                  key={lead._id}
                  className={`border-b hover:bg-purple-50/50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Phone */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">
                        {lead.phone}
                      </span>
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {lead.name || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setViewLead(lead)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(lead._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Lead Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Phone</label>
                <p className="bg-gray-50 p-3 rounded border">
                  {viewLead.phone}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold">Name</label>
                <p className="bg-gray-50 p-3 rounded border">
                  {viewLead.name || '—'}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                Created on: {new Date(viewLead.createdAt).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setViewLead(null)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-center mb-4">
              Delete Lead?
            </h3>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-red-50 border border-red-200 py-2.5 rounded-lg"
                onClick={() => setDeleteId(null)}
              >
                Delete
              </button>
              <button
                className="flex-1 bg-gray-100 py-2.5 rounded-lg"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsProjectPage;
