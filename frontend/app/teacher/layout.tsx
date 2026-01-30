'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const teacherNavItems = [
  { label: 'Dashboard', href: '/teacher' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout navItems={teacherNavItems} title="Teacher Portal">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
