import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/guard/ProtectedRoute';
import { RoleGuard } from '@/components/guard/RoleGuard';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('@/features/auth/pages/LoginPage');
      return { Component: LoginPage };
    },
  },
  {
    path: '/invoice/:token',
    lazy: async () => {
      const { PublicInvoicePage } = await import(
        '@/features/public-invoice/pages/PublicInvoicePage'
      );
      return { Component: PublicInvoicePage };
    },
  },

  // Protected Routes
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/pos" replace />,
      },
      {
        path: 'pos',
        lazy: async () => {
          const { PosPage } = await import('@/features/pos/pages/PosPage');
          return { Component: PosPage };
        },
      },
      {
        path: 'orders',
        lazy: async () => {
          const { OrdersListPage } = await import(
            '@/features/orders/pages/OrdersListPage'
          );
          return { Component: OrdersListPage };
        },
      },
      {
        path: 'orders/:id',
        lazy: async () => {
          const { OrderDetailPage } = await import(
            '@/features/orders/pages/OrderDetailPage'
          );
          return { Component: OrderDetailPage };
        },
      },
      {
        path: 'products',
        lazy: async () => {
          const { ProductsPage } = await import(
            '@/features/products/pages/ProductsPage'
          );
          return { Component: ProductsPage };
        },
      },
      {
        path: 'packages',
        lazy: async () => {
          const { PackagesPage } = await import(
            '@/features/packages/pages/PackagesPage'
          );
          return { Component: PackagesPage };
        },
      },
      {
        path: 'customers',
        lazy: async () => {
          const { CustomersPage } = await import(
            '@/features/customers/pages/CustomersPage'
          );
          return { Component: CustomersPage };
        },
      },
      {
        path: 'dashboard',
        lazy: async () => {
          const { DashboardPage } = await import(
            '@/features/dashboard/pages/DashboardPage'
          );
          return { Component: DashboardPage };
        },
      },
      {
        path: 'reports',
        lazy: async () => {
          const { ReportsPage } = await import(
            '@/features/reports/pages/ReportsPage'
          );
          const GuardedReportsPage = () => (
            <RoleGuard
              allowedRoles={['superadmin', 'owner']}
              fallback={<Navigate to="/pos" replace />}
            >
              <ReportsPage />
            </RoleGuard>
          );
          return { Component: GuardedReportsPage };
        },
      },
      {
        path: 'users',
        lazy: async () => {
          const { UsersPage } = await import(
            '@/features/users/pages/UsersPage'
          );
          const GuardedUsersPage = () => (
            <RoleGuard
              allowedRoles={['superadmin']}
              fallback={<Navigate to="/pos" replace />}
            >
              <UsersPage />
            </RoleGuard>
          );
          return { Component: GuardedUsersPage };
        },
      },
      {
        path: 'settings',
        lazy: async () => {
          const { SettingsPage } = await import(
            '@/features/settings/pages/SettingsPage'
          );
          return { Component: SettingsPage };
        },
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/pos" replace />,
  },
]);
