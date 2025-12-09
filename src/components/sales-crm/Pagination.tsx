import React from 'react';
import { Pagination as MuiPagination } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalItems?: number;
  itemsPerPage?: number;
}

const StyledPagination = styled(MuiPagination)(({ theme }) => ({
  '& .MuiPagination-ul': {
    justifyContent: 'end',
  },
  '& .MuiPaginationItem-root': {
    color: theme.palette.text.primary,
  },
}));

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className = '',
}) => {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };
  
  // Calculate total pages if totalItems and itemsPerPage are provided
  const calculatedTotalPages = totalItems 
    ? Math.ceil(totalItems / itemsPerPage)
    : totalPages || 1;
  
  // Don't render if there's only one page or no pages
  if (calculatedTotalPages <= 1) return null;

  return (
    <div className={`flex justify-end py-4 ${className}`}>
      <StyledPagination
        count={calculatedTotalPages}
        page={currentPage}
        onChange={handleChange}
        shape="rounded"
      />
    </div>
  );
};

export default Pagination;
