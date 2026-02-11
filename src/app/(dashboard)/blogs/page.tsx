'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { blogApi, Blog } from '@/api/blog.api';
import { categoryApi, Category } from '@/api/category.api';

// Dynamic import to avoid SSR issues with the editor
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface FormData {
  title: string;
  category: string;
  tags: string;
  slug: string;     // ✅ already added
  content: string;
  status: 'draft' | 'published';
}


const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
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
  content: '',
  status: 'draft',
  slug: '',
});

  const allTags = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Firebase', 'GraphQL', 'Express.js'];

  // Helper function to get category name from blog
  const getCategoryName = (category: string | { _id: string; name: string; [key: string]: any } | null | undefined): string => {
    if (!category) return 'Uncategorized';
    return typeof category === 'string' ? category : category.name;
  };

  // Helper function to strip markdown syntax and return clean text
  const stripMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    
    return markdown
      // Remove code blocks first
      .replace(/```[\s\S]*?```/g, '')
      // Remove headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic (handle multi-line)
      .replace(/\*\*\*[\s\S]*?\*\*\*/g, (match) => match.replace(/\*\*\*/g, ''))
      .replace(/\*\*[\s\S]*?\*\*/g, (match) => match.replace(/\*\*/g, ''))
      .replace(/\*[\s\S]*?\*/g, (match) => match.replace(/\*/g, ''))
      .replace(/___[\s\S]*?___/g, (match) => match.replace(/___/g, ''))
      .replace(/__[\s\S]*?__/g, (match) => match.replace(/__/g, ''))
      .replace(/_[\s\S]*?_/g, (match) => match.replace(/_/g, ''))
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove strikethrough
      .replace(/~~(.+?)~~/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove blockquotes
      .replace(/^\s*>\s+/gm, '')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Replace multiple line breaks with single space
      .replace(/\n{2,}/g, ' ')
      // Replace single line breaks with space
      .replace(/\n/g, ' ')
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      .trim();
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

  // Fetch blogs from API
  useEffect(() => {
    fetchBlogs();
  }, [currentPage, debouncedSearch, selectedCategory]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await blogApi.getAllBlogs(
        currentPage,
        limit,
        debouncedSearch,
        selectedCategory
      );
      if (response.success) {
        setBlogs(response.result.blogs);
        setTotalPages(response.result.pagination.totalPages);
        setTotalBlogs(response.result.pagination.totalBlogs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load blogs');
      console.error('Error fetching blogs:', err);
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

  const handleAddBlog = () => {
    setFormData({
      title: '',
      category: '',
      tags: '',
      content: '',
      status: 'draft',
      slug:""
    });
    setImagePreview('');
    setImageFile(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditBlog = async (blog: Blog) => {
    setIsSubmitting(true);
    try {
      // Fetch full blog details by ID
      const response = await blogApi.getBlogById(blog._id);
      
      if (response.success) {
        const fullBlog = response.result;
        // Extract category ID - handle both string and object
        const categoryId = typeof fullBlog.category === 'string' 
          ? fullBlog.category 
          : fullBlog.category._id;
        
       setFormData({
  title: fullBlog.title,
  slug: fullBlog.slug,     // ✅ ADD
  category: categoryId,
  tags: fullBlog.tags.join(', '),
  content: fullBlog.content,
  status: fullBlog.status,
});

        setImagePreview(fullBlog.coverImage);
        setImageFile(null);
        setEditingId(fullBlog._id);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load blog details');
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.title || !formData.category || !formData.tags || !formData.content || !formData.slug) {
    alert('Please fill all required fields including slug');
    return;
  }

  if (formData.title.length < 5) {
    alert('Title must be at least 5 characters long');
    return;
  }

  if (!editingId && !imageFile) {
    alert('Please upload a cover image');
    return;
  }

  setIsSubmitting(true);
  try {
    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(t => t);

    if (editingId) {
      // Update blog
      const updateData: any = {
        title: formData.title,
        slug: formData.slug,      // ✅ ADD THIS
        category: formData.category,
        tags: tagsArray,
        content: formData.content,
        status: formData.status,
      };
      
      if (imageFile) {
        updateData.coverImage = imageFile;
      }

      await blogApi.updateBlog(editingId, updateData);
    } else {
      // Create new blog
      if (!imageFile) return;
      
      await blogApi.createBlog({
        coverImage: imageFile,
        title: formData.title,
        slug: formData.slug,      // ✅ ADD THIS
        category: formData.category, 
        tags: tagsArray,
        content: formData.content,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
    setFormData({
      title: '',
      category: '',
      tags: '',
      content: '',
      status: 'draft',
      slug: ''
    });
    setImagePreview('');
    setImageFile(null);
    fetchBlogs(); // Refresh the list
  } catch (err: any) {
    alert(err.message || 'Failed to save blog');
  } finally {
    setIsSubmitting(false);
  }
}; // ✅ This closing brace was the issue

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await blogApi.deleteBlog(deleteId);
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        fetchBlogs(); // Refresh the list
      } catch (err: any) {
        alert(err.message || 'Failed to delete blog');
      }
    }
  };

  return (
    <div className=" bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Blogs</h1>
            <p className="text-gray-600">Manage your blog posts</p>
          </div>
          <button
            onClick={handleAddBlog}
            className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Blog</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          Total: {totalBlogs}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4 opacity-50">📝</div>
          <p className="text-gray-600 text-lg mb-6">
            {debouncedSearch || selectedCategory !== 'All' 
              ? 'No blogs found matching your search.' 
              : 'No blogs yet. Create your first blog post!'}
          </p>
          {(debouncedSearch || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Blogs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-200/50 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>

                  {/* Status & Category Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full shadow-lg ${
                      blog.status === 'published' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {blog.status}
                    </div>
                    <div className="bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg truncate">
                      {getCategoryName(blog.category)}
                    </div>
                  </div>

                  {/* Read Time Badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                    <ClockIcon className="w-3 h-3" />
                    {blog.readingTime} min
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{stripMarkdown(blog.content)}</p>

                  {/* Tags */}
                  <div className="mb-3 mt-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Tags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {blog.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{blog.tags.length - 2}</span>
                      )}
                    </div>
                  </div>

                  {/* Author & Date */}
                  {/* Author & Date */}
<div className="mb-3">
  <p className="text-xs text-gray-500 truncate">
    By {blog.author?.name || 'Unknown'} • {new Date(blog.publishedAt).toLocaleDateString()}
  </p>
</div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBlog(blog)}
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
                      onClick={() => handleDeleteClick(blog._id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-gray-500">
                  Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalBlogs)} of {totalBlogs}
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
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Blog Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog title (minimum 5 characters)"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  disabled={isSubmitting}
                  minLength={5}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters (min: 5)
                </p>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    disabled={isSubmitting}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    disabled={isSubmitting}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
{/* Slug */}
<div>
  <label className="block text-sm font-semibold text-gray-900 mb-2">
    Slug <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="slug"
    value={formData.slug}
    onChange={(e) =>
      setFormData({
        ...formData,
        slug: e.target.value
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '')
          .replace(/\s+/g, '-'),
      })
    }
    placeholder="e.g. learn-react-basics"
    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg
      text-gray-900 placeholder-gray-500 focus:outline-none
      focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
    disabled={isSubmitting}
  />
</div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags <span className="text-red-500">*</span>
                  <span className="block text-xs font-normal text-gray-600 mt-1">
                    (Comma-separated, e.g., React, Node.js, MongoDB)
                  </span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  disabled={isSubmitting}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {allTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = formData.tags.split(',').map((t) => t.trim());
                        if (!current.includes(tag)) {
                          setFormData({
                            ...formData,
                            tags: formData.tags ? `${formData.tags}, ${tag}` : tag,
                          });
                        }
                      }}
                      className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full border border-blue-200 transition-all"
                      disabled={isSubmitting}
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Blog Content <span className="text-red-500">*</span>
                </label>
                <div data-color-mode="light" className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
                  <MDEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value || '' })}
                    preview="live"
                    height={400}
                    visibleDragbar={false}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Left: Write with markdown • Right: See live preview with formatting (bold, italic, lists, etc.)
                </p>
              </div>

              {/* Image Upload */}
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
                        <p className="text-sm text-gray-700">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-700 font-medium">Click to upload image</p>
                        <p className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP up to 5MB</p>
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
                      <span>{editingId ? 'Update Blog' : 'Create Blog'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Blog?</h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. The blog post will be permanently deleted.
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

export default BlogsPage;
