"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { testimonialApi, Testimonial } from "@/api/testimonial.api";

interface FormData {
  name: string;
  position: string;
  company: string;
  description: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    position: "",
    company: "",
    description: "",
  });

  // Fetch testimonials from API
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await testimonialApi.getAllTestimonials();
      if (response.success) {
        setTestimonials(response.result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load testimonials");
      console.error("Error fetching testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter testimonials based on search
  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open modal for add
  const handleAddTestimonial = () => {
    setFormData({
      name: "",
      position: "",
      company: "",
      description: "",
    });
    setImagePreview("");
    setImageFile(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditTestimonial = async (testimonial: Testimonial) => {
    setIsSubmitting(true);
    try {
      const response = await testimonialApi.getTestimonialById(testimonial._id);
      if (response.success) {
        const fullTestimonial = response.result;
        setFormData({
          name: fullTestimonial.name,
          position: fullTestimonial.position,
          company: fullTestimonial.company,
          description: fullTestimonial.description,
        });
        setImagePreview(fullTestimonial.coverImage);
        setImageFile(null);
        setEditingId(fullTestimonial._id);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || "Failed to load testimonial details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      position: "",
      company: "",
      description: "",
    });
    setImagePreview("");
    setImageFile(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.position || !formData.company || !formData.description) {
      alert("Please fill all required fields");
      return;
    }

    if (!editingId && !imageFile) {
      alert("Please upload a cover image");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update testimonial
        const updateData: any = {
          name: formData.name,
          position: formData.position,
          company: formData.company,
          description: formData.description,
        };

        if (imageFile) {
          updateData.coverImage = imageFile;
        }

        await testimonialApi.updateTestimonial(editingId, updateData);
      } else {
        // Create new testimonial
        if (!imageFile) return;

        await testimonialApi.createTestimonial({
          coverImage: imageFile,
          name: formData.name,
          position: formData.position,
          company: formData.company,
          description: formData.description,
        });
      }

      closeModal();
      fetchTestimonials(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete testimonial
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await testimonialApi.deleteTestimonial(deleteId);
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        fetchTestimonials(); // Refresh the list
      } catch (err: any) {
        alert(err.message || "Failed to delete testimonial");
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Testimonials
            </h1>
            <p className="text-gray-600">Manage customer testimonials</p>
          </div>
          <button
            onClick={handleAddTestimonial}
            className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : (
            <MagnifyingGlassIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center">
          Total: {testimonials.length}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading testimonials...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4 opacity-50">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No testimonials found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? `No testimonials matching "${searchQuery}"`
              : "Get started by creating your first testimonial"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-200/50 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-purple-100 to-blue-100">
                <img
                  src={testimonial.coverImage}
                  alt={testimonial.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Name */}
                <div className="flex items-center gap-2 mb-2">
                  <UserCircleIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {testimonial.name}
                  </h3>
                </div>

                {/* Position */}
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseIcon className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600 truncate">
                    {testimonial.position}
                  </p>
                </div>

                {/* Company */}
                <div className="flex items-center gap-2 mb-3">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-purple-600 truncate">
                    {testimonial.company}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  "{testimonial.description}"
                </p>

                {/* Date */}
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTestimonial(testimonial)}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <>
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(testimonial._id)}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium transition-all duration-200 border border-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cover Image {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-input"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="image-input" className="cursor-pointer block">
                    {imagePreview ? (
                      <div>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                        <p className="text-sm text-gray-700">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-700 font-medium">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              {/* Position & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., CEO"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Tech Corp"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter testimonial description"
                  rows={5}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingId ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>{editingId ? "Update" : "Create"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-all duration-200 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Testimonial?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The testimonial will be permanently
              deleted.
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
}
