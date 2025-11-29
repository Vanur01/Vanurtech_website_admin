'use client';

import React, { useEffect, useState } from 'react';
import { authApi } from '@/api/auth.api';
import {
  FolderIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = authApi.getUserData();
    setUserData(user);
  }, []);

  const stats = [
    {
      label: 'Total Projects',
      value: '0',
      icon: <FolderIcon className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Blogs',
      value: '0',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Total Contacts',
      value: '0',
      icon: <EnvelopeIcon className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="bg-linear-to-br from-white via-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.name || 'Admin'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your portfolio today.
        </p>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 ${stat.bgColor} rounded-xl ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Quick Actions */}
      <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/projects"
            className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all duration-300 hover:shadow-md"
          >
            <FolderIcon className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-blue-900">Manage Projects</span>
          </a>
          <a
            href="/blogs"
            className="flex items-center gap-3 p-4 bg-linear-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all duration-300 hover:shadow-md"
          >
            <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-purple-900">Manage Blogs</span>
          </a>
          <a
            href="/contact"
            className="flex items-center gap-3 p-4 bg-linear-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all duration-300 hover:shadow-md"
          >
            <EnvelopeIcon className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-900">View Contacts</span>
          </a>
        </div>
      </div>

      {/* User Info Card */}
      {userData && (
        <div className="bg-white backdrop-blur-md rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <UserIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{userData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        userData.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
