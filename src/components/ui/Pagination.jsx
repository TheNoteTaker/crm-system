import React from 'react';
import { Button } from './Button';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Show max 5 page numbers, centered around current page
  const visiblePages = pages.filter(page => {
    if (totalPages <= 5) return true;
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - currentPage) <= 1;
  });

  // Add ellipsis where needed
  const pagesWithEllipsis = visiblePages.reduce((acc, page, i) => {
    if (i > 0 && page - visiblePages[i - 1] > 1) {
      acc.push('...');
    }
    acc.push(page);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {pagesWithEllipsis.map((page, index) => 
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-hover'
              }`}
            >
              {page}
            </button>
          )
        )}

        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}