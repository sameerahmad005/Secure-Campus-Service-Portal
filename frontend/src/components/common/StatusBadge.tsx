import React from 'react';
import type { ComplaintStatus, ServiceRequestStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus | ServiceRequestStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status) {
      case 'SUBMITTED':
        return 'badge-submitted';
      case 'UNDER_REVIEW':
        return 'badge-under-review';
      case 'IN_PROGRESS':
        return 'badge-in-progress';
      case 'RESOLVED':
      case 'FULFILLED':
        return 'badge-resolved';
      case 'REJECTED':
        return 'badge-rejected';
      case 'CLOSED':
      default:
        return 'badge-closed';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`badge-status ${getStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {formatText(status)}
    </span>
  );
};
