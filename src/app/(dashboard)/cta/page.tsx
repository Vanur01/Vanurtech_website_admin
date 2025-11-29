'use client';

import React, { useState, useEffect } from 'react';
import {
  TrashIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { ctaApi, CTA } from '@/api/cta.api';

const CTAPage = () => {
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCTA, setSelectedCTA] = useState<CTA | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch CTAs from API
  useEffect(() => {
    fetchCTAs();
  }, []);

  const fetchCTAs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await ctaApi.getAllCTAs();
      if (response.success) {
        setCtas(response.result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load CTAs');
      console.error('Error fetching CTAs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await ctaApi.deleteCTA(deleteId);
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        fetchCTAs(); // Refresh the list
      } catch (err: any) {
        alert(err.message || 'Failed to delete CTA');
      }
    }
  };

  const handleViewCTA = (cta: CTA) => {
    setSelectedCTA(cta);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">CTA Requests</h1>
          <p className="text-gray-600">Manage call-to-action requests</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Total Count */}
      <div className="mb-6 text-right">
        <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 inline-block">
          Total: {ctas.length}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading CTAs...</p>
        </div>
      ) : ctas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4 opacity-50">📞</div>
          <p className="text-gray-600 text-lg">No CTA requests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-lg">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile Number</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Message</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {ctas.map((cta, index) => (
                <tr
                  key={cta._id}
                  className={`border-b border-gray-200 hover:bg-purple-50/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Mobile Number */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">{cta.mobile}</span>
                    </div>
                  </td>

                  {/* Message */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate max-w-xs">{cta.message}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 sm:px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(cta.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewCTA(cta)}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cta._id)}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                        title="Delete"
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

      {/* View CTA Modal */}
      {isViewModalOpen && selectedCTA && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 w-full max-w-2xl shadow-2xl my-8">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-blue-50 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">CTA Request Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Mobile Number */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PhoneIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">Mobile Number</label>
                </div>
                <p className="text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                  {selectedCTA.mobile}
                </p>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">Message</label>
                </div>
                <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedCTA.message}
                </p>
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500">
                Received on: {new Date(selectedCTA.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2.5 rounded-lg font-semibold transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDeleteClick(selectedCTA._id);
                  setIsViewModalOpen(false);
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-semibold transition-all duration-200 border border-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-red-200 w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete CTA Request?</h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The CTA request will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-semibold transition-all border border-red-200"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-all border border-gray-200"
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

export default CTAPage;
