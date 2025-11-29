'use client';

import React, { useState, useEffect } from 'react';
import {
  TrashIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { contactApi, Contact } from '@/api/contact.api';

const ContactPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const limit = 10;
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch contacts from API
  useEffect(() => {
    fetchContacts();
  }, [currentPage, debouncedSearch]);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await contactApi.getAllContacts(currentPage, limit, debouncedSearch);
      if (response.success) {
        setContacts(response.result.data);
        setTotalPages(response.result.pagination.totalPages);
        setTotalContacts(response.result.pagination.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setContacts(contacts.filter((contact) => contact._id !== deleteId));
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Contact Messages</h1>
          <p className="text-gray-600">Manage all incoming contact requests</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, company, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <svg
                className="absolute right-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {debouncedSearch && (
            <div className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
              🔍 Searching...
            </div>
          )}
          <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
            Total: {totalContacts}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4 opacity-50">📧</div>
          <p className="text-gray-600 text-lg">
            {debouncedSearch ? `No contacts found for "${debouncedSearch}"` : 'No contact messages yet.'}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-lg">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Services</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {contacts.map((contact, index) => (
                <tr
                  key={contact._id}
                  className={`border-b border-gray-200 hover:bg-purple-50/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Name */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {contact.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{contact.email}</span>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{contact.company}</span>
                    </div>
                  </td>

                  {/* Services */}
                  <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.services.slice(0, 2).map((service, idx) => (
                        <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                      {contact.services.length > 2 && (
                        <span className="text-xs text-gray-500">+{contact.services.length - 2}</span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 sm:px-6 py-4">
                    <span className="text-sm text-gray-600">{contact.createdAt}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewContact(contact)}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => handleDeleteClick(contact._id)}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <span className="hidden sm:inline text-gray-400">|</span>
            <span className="text-gray-500">
              Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalContacts)} of {totalContacts}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {!isLoading && debouncedSearch && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
          <span className="font-medium">Search Results for &quot;{debouncedSearch}&quot;:</span> Found {totalContacts} contact{totalContacts !== 1 ? 's' : ''}
          {totalContacts > 0 && totalPages > 1 && <span className="ml-1">(showing page {currentPage} of {totalPages})</span>}
        </div>
      )}

      {/* View Contact Modal */}
      {isViewModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 w-full max-w-2xl shadow-2xl my-8">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-blue-50 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
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

            {/* Modal Content - Scrollable */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">Name</label>
                </div>
                <p className="text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                  {selectedContact.name}
                </p>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">Email</label>
                </div>
                <p className="text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 break-all">
                  {selectedContact.email}
                </p>
              </div>

              {/* Company Name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">Company Name</label>
                </div>
                <p className="text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                  {selectedContact.company}
                </p>
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">What's in your mind</label>
                </div>
                <div className="flex flex-wrap gap-2 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                  {selectedContact.services.map((service, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Message</label>
                <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedContact.message}
                </p>
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500">
                Received on: {new Date(selectedContact.createdAt).toLocaleString()}
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
              {/* <button
                onClick={() => {
                  handleDeleteClick(selectedContact._id);
                  setIsViewModalOpen(false);
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-semibold transition-all duration-200 border border-red-200"
              >
                Delete
              </button> */}
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Contact?</h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The contact message will be permanently deleted.
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

export default ContactPage;
