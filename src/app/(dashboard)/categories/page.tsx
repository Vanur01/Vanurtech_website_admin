"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  TagIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { categoryApi, Category } from "@/api/category.api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await categoryApi.getAllCategories();
      if (response.success) {
        setCategories(response.result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for add
  const handleAddCategory = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditCategory = async (category: Category) => {
    setIsSubmitting(true);
    try {
      const response = await categoryApi.getCategoryById(category._id);
      if (response.success) {
        const fullCategory = response.result;
        setFormData({
          name: fullCategory.name,
          description: fullCategory.description,
        });
        setEditingId(fullCategory._id);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || "Failed to load category details");
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
      description: "",
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update category
        await categoryApi.updateCategory(editingId, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        // Create new category
        await categoryApi.createCategory({
          name: formData.name,
          description: formData.description,
        });
      }

      closeModal();
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await categoryApi.deleteCategory(deleteId);
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        fetchCategories(); // Refresh the list
      } catch (err: any) {
        alert(err.message || "Failed to delete category");
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Categories</h1>
            <p className="text-gray-600">Manage your content categories</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Category</span>
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
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : (
            <MagnifyingGlassIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center">
          Total: {categories.length}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4 opacity-50">🏷️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? `No categories matching "${searchQuery}"`
              : "Get started by creating your first category"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredCategories.map((category, index) => (
                <tr
                  key={category._id}
                  className={`border-b border-gray-200 hover:bg-purple-50/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Category Name */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-linear-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <TagIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 sm:px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <PencilIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category._id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  placeholder="Enter category description"
                  disabled={isSubmitting}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
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
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              Delete Category?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The category will be permanently deleted.
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
