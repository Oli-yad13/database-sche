'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const studentNavItems = [
  { label: 'Dashboard', href: '/student' },
  { label: 'Profile', href: '/student/profile' },
];

interface StudentAuth {
  studentId: string;
  department: string;
  yearLevel: string;
  role: string;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [studentAuth, setStudentAuth] = useState<StudentAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for student quick-access auth
    const storedStudentAuth = localStorage.getItem('studentAuth');
    if (storedStudentAuth) {
      try {
        setStudentAuth(JSON.parse(storedStudentAuth));
      } catch (e) {
        console.error('Error parsing studentAuth:', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !authLoading) {
      // Allow access if user is authenticated as student OR has studentAuth
      const isAuthenticatedStudent = user && user.role === 'student';
      const hasStudentAuth = studentAuth !== null;

      if (!isAuthenticatedStudent && !hasStudentAuth) {
        router.push('/auth/student-login');
      }
    }
  }, [user, authLoading, studentAuth, isLoading, router]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow access if authenticated or has studentAuth
  const isAuthenticatedStudent = user && user.role === 'student';
  const hasStudentAuth = studentAuth !== null;

  if (!isAuthenticatedStudent && !hasStudentAuth) {
    return null;
  }

  return (
    <DashboardLayout navItems={studentNavItems} title="Student Portal">
      {children}
    </DashboardLayout>
  );
}
