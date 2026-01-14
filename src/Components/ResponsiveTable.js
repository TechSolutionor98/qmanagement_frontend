'use client';

/**
 * ResponsiveTable Component
 * A reusable responsive table wrapper that handles mobile and desktop views
 * 
 * Usage:
 * <ResponsiveTable>
 *   <table>...</table>
 * </ResponsiveTable>
 */
export default function ResponsiveTable({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto shadow-md rounded-lg ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * ResponsiveCard Component
 * A mobile-friendly card view for table data
 * Use this as an alternative to tables on very small screens
 */
export function ResponsiveCard({ title, items, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span className="text-sm font-medium text-gray-600">{item.label}:</span>
            <span className="text-sm text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ResponsiveGrid Component
 * A responsive grid container that adjusts columns based on screen size
 */
export function ResponsiveGrid({ children, cols = { sm: 1, md: 2, lg: 3, xl: 4 }, gap = 4, className = '' }) {
  const gridCols = `
    grid-cols-${cols.sm} 
    md:grid-cols-${cols.md} 
    lg:grid-cols-${cols.lg} 
    xl:grid-cols-${cols.xl}
  `;
  
  return (
    <div className={`grid ${gridCols} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * ResponsiveModal Component
 * A modal that adapts to screen size
 */
export function ResponsiveModal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          {title && (
            <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="px-4 md:px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ResponsiveButton Component
 * A button that adjusts size and padding based on screen
 */
export function ResponsiveButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
