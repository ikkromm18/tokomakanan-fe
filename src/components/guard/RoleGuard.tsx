import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/core/types/common';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Role-Based Access Control component.
 * Renders children only if current user has one of the allowed roles.
 * Useful for conditionally hiding sensitive data like HPP from cashier ('admin').
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  fallback = null,
  children,
}) => {
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
