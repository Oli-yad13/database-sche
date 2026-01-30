'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Calendar,
  Users,
  BarChart3,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'teacher':
          router.push('/teacher');
          break;
        case 'student':
          router.push('/student');
          break;
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Fixed, minimal */}
      <nav className="fixed w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Swiss typography */}
            <div className="flex items-center">
              <div className="text-2xl font-bold tracking-tight text-black">
                UNISCHEDULE
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-8">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
              >
                Staff Login
              </Link>
              <Link
                href="/auth/student-login"
                className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Student Access
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Large typography, asymmetric */}
      <section className="pt-40 pb-32 px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left - Hero text */}
            <div className="lg:col-span-7">
              <div className="inline-block px-4 py-2 border border-gray-200 text-xs font-medium tracking-wide uppercase mb-8">
                University Management
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-none tracking-tight text-black mb-8">
                Schedule<br />
                Everything<br />
                <span className="text-gray-400">Precisely</span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-xl leading-relaxed">
                Grid-based scheduling system for modern universities.
                Manage courses, rooms, teachers, and schedules with precision.
              </p>

              <div className="flex gap-4">
                <Link
                  href="/auth/student-login"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-200"
                >
                  Student Access
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-gray-200 text-black font-medium hover:border-black transition-colors duration-200"
                >
                  Staff Login
                </Link>
              </div>
            </div>

            {/* Right - Stats grid */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-1 bg-gray-200 p-1">
                <div className="bg-white p-8">
                  <div className="text-4xl font-bold text-black mb-2">2.5K+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-4xl font-bold text-black mb-2">150+</div>
                  <div className="text-sm text-gray-600">Instructors</div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-4xl font-bold text-black mb-2">300+</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-4xl font-bold text-black mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Grid-based, minimal */}
      <section className="py-32 px-8 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-20">
            <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
              Core Features
            </div>
            <h2 className="text-5xl font-bold text-black">
              Built for precision
            </h2>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-gray-200">
            {/* Feature 1 */}
            <div className="bg-white p-12 hover:bg-gray-50 transition-colors duration-200">
              <Calendar className="h-8 w-8 text-black mb-6" />
              <h3 className="text-xl font-bold text-black mb-4">
                Smart Scheduling
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automated conflict detection and room allocation. Grid-based visual timeline.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-12 hover:bg-gray-50 transition-colors duration-200">
              <Users className="h-8 w-8 text-black mb-6" />
              <h3 className="text-xl font-bold text-black mb-4">
                Role Management
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Separate interfaces for administrators, teachers, and students.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-12 hover:bg-gray-50 transition-colors duration-200">
              <BarChart3 className="h-8 w-8 text-black mb-6" />
              <h3 className="text-xl font-bold text-black mb-4">
                Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time insights on utilization, enrollment, and performance metrics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-12 hover:bg-gray-50 transition-colors duration-200">
              <CheckCircle2 className="h-8 w-8 text-black mb-6" />
              <h3 className="text-xl font-bold text-black mb-4">
                Room Assignment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automated room allocation with building and floor management.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-12 hover:bg-gray-50 transition-colors duration-200">
              <FileText className="h-8 w-8 text-black mb-6" />
              <h3 className="text-xl font-bold text-black mb-4">
                Event Calendar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track holidays, exam periods, and special events that affect schedules.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-12 hover:bg-gray-50 transition-colors duration-200">
              <Shield className="h-8 w-8 text-black mb-6" />
              <h3 className="text-xl font-bold text-black mb-4">
                Enterprise Security
              </h3>
              <p className="text-gray-600 leading-relaxed">
                JWT authentication, encrypted data, role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Asymmetric, bold */}
      <section className="py-32 px-8 lg:px-12 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Access your<br />schedule now
              </h2>
              <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                Students access with ID. Staff login with credentials.
              </p>
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Staff Login
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-gray-800">
              <div className="bg-gray-900 p-8">
                <div className="text-sm text-gray-400 mb-2">Setup time</div>
                <div className="text-2xl font-bold">5 min</div>
              </div>
              <div className="bg-gray-900 p-8">
                <div className="text-sm text-gray-400 mb-2">Support</div>
                <div className="text-2xl font-bold">24/7</div>
              </div>
              <div className="bg-gray-900 p-8">
                <div className="text-sm text-gray-400 mb-2">Data backup</div>
                <div className="text-2xl font-bold">Daily</div>
              </div>
              <div className="bg-gray-900 p-8">
                <div className="text-sm text-gray-400 mb-2">API access</div>
                <div className="text-2xl font-bold">Full</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 px-8 lg:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2026 UniSchedule. All rights reserved.
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
