'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

interface StudentAuth {
  studentId: string;
  department: string;
  yearLevel: string;
  role: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [studentAuth, setStudentAuth] = useState<StudentAuth | null>(null);

  useEffect(() => {
    // Check for student quick-access auth
    const stored = localStorage.getItem('studentAuth');
    if (stored) {
      try {
        setStudentAuth(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing studentAuth:', e);
      }
    }
  }, []);

  // Get display name and role
  const displayName = user?.username || studentAuth?.studentId || 'User';
  const displayRole = user?.role || studentAuth?.role || 'student';

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      if (user) {
        await logout();
      } else if (studentAuth) {
        // Clear student quick-access auth
        localStorage.removeItem('studentAuth');
        router.push('/auth/student-login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-8">
          <div className="flex justify-between h-20">
            {/* Left side */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? ( 
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <Link href="/" className="text-2xl font-bold tracking-tight text-black">
                UNISCHEDULE
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{displayRole}</p>
                  </div>
                  <div className="flex items-center justify-center h-10 w-10 bg-black text-white font-medium">
                    {displayName[0].toUpperCase()}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 border border-gray-200 bg-white">
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-20 h-full bg-white border-r border-gray-200 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        }`}
        style={{ top: '5rem' }}
      >
        <div className="p-6">
          <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
        style={{ marginTop: '5rem' }}
      >
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
