"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/api/auth.api";
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/home';
  const registered = searchParams.get('registered');
  
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoPassword, setShowDemoPassword] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      router.push("/home");
    }
  }, [router]);

  // Show success message if redirected from registration
  useEffect(() => {
    if (registered === 'true') {
      setSuccessMessage("Account created successfully! Please sign in with your credentials.");
      // Clear the URL parameter
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/sign-in');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [registered]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
    setSuccessMessage(""); // Clear success message on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login(formData);

      if (response.success) {
        // Redirect to intended page or home
        router.push(redirectUrl);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to access your admin dashboard
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email/Phone Input */}
            <div className="space-y-1">
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your email or phone"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-12 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-xl bg-green-50 border border-green-100 p-3 animate-fadeIn">
                <div className="flex items-start">
                  <div className="shrink-0 mt-0.5">
                    <svg
                      className="h-4 w-4 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 animate-fadeIn">
                <div className="flex items-start">
                  <div className="shrink-0 mt-0.5">
                    <svg
                      className="h-4 w-4 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center items-center py-3 px-6 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 transform ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <span className="flex items-center">
                    Sign in to Dashboard
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-medium">Or</span>
            </div>
          </div> */}

          {/* <div className="text-center">
            <Link
              href="/auth/sign-up"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Don't have an account? Sign up →
            </Link>
          </div> */}

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-medium">Access Codes</span>
            </div>
          </div> */}

            {/* <div className="rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-900 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Login Info — Keep it secret, We Trust You . . .
              </p>
              <div className="space-y-1 pl-6">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Email:</span>{" "}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">vanurtechmedia@gmail.com</span>
              </p>
              <p className="text-xs text-blue-800 flex items-center gap-2">
                <span className="font-semibold">Password:</span>{" "}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">
                {showDemoPassword ? "vanurtechmedia@123" : "••••••••••••••••"}
                </span>
                <button
                type="button"
                onClick={() => setShowDemoPassword(!showDemoPassword)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                {showDemoPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
                </button>
              </p>
              </div>
            </div>
            </div> */}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secured with industry-standard encryption</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2025 VTM Admin. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 300ms ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
