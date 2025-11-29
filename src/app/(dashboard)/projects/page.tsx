'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { projectApi, Project } from '@/api/project.api';
import { categoryApi, Category } from '@/api/category.api';

interface FormData {
  title: string;
  category: string;
  tags: string;
  description: string;
  website: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const limit = 10;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    tags: '',
    description: '',
    website: '',
  });

  // Helper function to get category name from project
  const getCategoryName = (category: string | { _id: string; name: string; [key: string]: any } | null | undefined): string => {
    if (!category) return 'Uncategorized';
    return typeof category === 'string' ? category : category.name;
  };

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      if (response.success) {
        setCategories(response.result);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, [currentPage, debouncedSearch, selectedCategory]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await projectApi.getAllProjects(
        currentPage,
        limit,
        debouncedSearch,
        selectedCategory
      );
      if (response.success) {
        setProjects(response.result.projects);
        setTotalPages(response.result.pagination.totalPages);
        setTotalProjects(response.result.pagination.totalProjects);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddProject = () => {
    setFormData({
      title: '',
      category: '',
      tags: '',
      description: '',
      website: '',
    });
    setImagePreview('');
    setImageFile(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditProject = async (project: Project) => {
    setIsSubmitting(true);
    try {
      const response = await projectApi.getProjectById(project._id);
      if (response.success) {
        const fullProject = response.result;
        // Extract category ID - handle both string and object
        const categoryId = typeof fullProject.category === 'string' 
          ? fullProject.category 
          : fullProject.category._id;
        
        setFormData({
          title: fullProject.title,
          category: categoryId,
          tags: fullProject.tags.join(', '),
          description: fullProject.description,
          website: fullProject.website || '',
        });
        setImagePreview(fullProject.image);
        setImageFile(null);
        setEditingId(fullProject._id);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch project details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.tags || !formData.description) {
      console.warn('Please fill all required fields');
      return;
    }

    if (!editingId && !imageFile) {
      console.warn('Please upload a project image');
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(t => t);

      if (editingId) {
        // Update project
        const updateData: any = {
          title: formData.title,
          category: formData.category, // This is already the categoryId from form
          tags: tagsArray,
          description: formData.description,
          website: formData.website,
        };
        if (imageFile) {
          updateData.image = imageFile;
        }
        const response = await projectApi.updateProject(editingId, updateData);
        if (response.success) {
          setIsModalOpen(false);
          fetchProjects();
        }
      } else {
        // Create new project
        if (!imageFile) return;
        const createData = {
          image: imageFile,
          title: formData.title,
          category: formData.category, // This is already the categoryId from form
          tags: tagsArray,
          description: formData.description,
          website: formData.website,
        };
        const response = await projectApi.createProject(createData);
        if (response.success) {
          setIsModalOpen(false);
          fetchProjects();
        }
      }

      setFormData({
        title: '',
        category: '',
        tags: '',
        description: '',
        website: '',
      });
      setImagePreview('');
      setImageFile(null);
    } catch (err: any) {
      console.error('Failed to save project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    try {
      const response = await projectApi.deleteProject(deleteId);
      if (response.success) {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        fetchProjects();
      }
    } catch (err: any) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Manage your portfolio projects</p>
          </div>
          <button
            onClick={handleAddProject}
            className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Project</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          {/* <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select> */}
        </div>

        {/* Search Info */}
        {debouncedSearch && (
          <div className="mb-4 text-sm text-gray-600">
            {isLoading ? (
              <span>🔍 Searching...</span>
            ) : (
              <span>
                Found {totalProjects} project{totalProjects !== 1 ? 's' : ''} for "{debouncedSearch}"
                {totalProjects > 0 && ` (showing page ${currentPage} of ${totalPages})`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="bg-purple-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-600 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4 opacity-50">📁</div>
          <p className="text-gray-600 text-lg mb-6">
            {debouncedSearch || selectedCategory !== 'All'
              ? 'No projects found matching your criteria.'
              : 'No projects yet. Create your first project!'}
          </p>
          {(!debouncedSearch && selectedCategory === 'All') && (
            <button
              onClick={handleAddProject}
              className="bg-linear-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group relative bg-white backdrop-blur-md rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-200/50"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    {getCategoryName(project.category)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{project.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{project.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleEditProject(project)}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <PencilIcon className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project._id)}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium transition-all duration-200 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages} ({totalProjects} total)
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Project Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags <span className="text-red-500">*</span>
                  <span className="block text-xs font-normal text-gray-600 mt-1">
                    (Comma-separated, e.g., portfolio, web, react)
                  </span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., portfolio, web, react"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none disabled:opacity-50"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-50"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Image {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer block">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="mt-2 text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-gray-600 mb-1">Click to upload project image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
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
                      <span>{editingId ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      {editingId ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-all duration-200 border border-gray-200 disabled:opacity-50"
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Project?</h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The project will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-semibold transition-all border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-all border border-gray-200 disabled:opacity-50"
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

export default ProjectsPage;
