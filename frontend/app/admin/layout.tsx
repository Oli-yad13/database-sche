"use client";
// Imports authentication guard and dashboard layout components
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Defines the navigation links for the admin panel
const adminNavItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Departments", href: "/admin/departments" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Sections", href: "/admin/sections" },
  { label: "Rooms", href: "/admin/rooms" },
  { label: "Time Slots", href: "/admin/timeslots" },
  { label: "Users", href: "/admin/users" },
  { label: "Events", href: "/admin/events" },
];

// Wraps children in admin-protected dashboard layout with navigation
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout navItems={adminNavItems} title="Admin Dashboard">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
