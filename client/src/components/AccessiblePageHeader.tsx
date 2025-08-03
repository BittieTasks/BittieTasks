import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { AccessibleButton } from '@/components/ui/accessible-button';

interface AccessiblePageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backPath?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    path?: string;
  }>;
}

export const AccessiblePageHeader: React.FC<AccessiblePageHeaderProps> = ({
  title,
  description,
  showBackButton = false,
  backPath = '/',
  actions,
  breadcrumbs
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-6" role="banner">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400" aria-hidden="true">
                    /
                  </span>
                )}
                {crumb.path ? (
                  <Link
                    href={crumb.path}
                    className="hover:text-blue-600 transition-colors"
                    aria-label={`Navigate to ${crumb.label}`}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span 
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Link href={backPath}>
              <AccessibleButton
                variant="ghost"
                size="sm"
                ariaLabel="Go back to previous page"
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </AccessibleButton>
            </Link>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};