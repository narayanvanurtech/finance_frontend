"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Paper,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  TableSortLabel
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

interface Report {
  id: number;
  reportName: string;
  category: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  views: number;
  downloads: number;
  status: 'Published' | 'Draft' | 'Archived';
  format: 'PDF' | 'Excel';
}

const reportData: Report[] = [
  {
    id: 1,
    reportName: 'Sales Q2 2023',
    category: 'Sales',
    createdBy: 'John Smith',
    createdDate: '2023-04-15',
    lastModified: '2023-06-20',
    views: 245,
    downloads: 87,
    status: 'Published',
    format: 'PDF'
  },
  {
    id: 2,
    reportName: 'Marketing Campaign ROI',
    category: 'Marketing',
    createdBy: 'Sarah Johnson',
    createdDate: '2023-05-10',
    lastModified: '2023-07-15',
    views: 189,
    downloads: 42,
    status: 'Published',
    format: 'Excel'
  },
  {
    id: 3,
    reportName: 'Customer Satisfaction',
    category: 'Customer',
    createdBy: 'Michael Chen',
    createdDate: '2023-06-01',
    lastModified: '2023-06-30',
    views: 132,
    downloads: 35,
    status: 'Draft',
    format: 'PDF'
  },
  {
    id: 4,
    reportName: 'Inventory Levels',
    category: 'Operations',
    createdBy: 'Emily Wilson',
    createdDate: '2023-03-22',
    lastModified: '2023-07-18',
    views: 178,
    downloads: 56,
    status: 'Published',
    format: 'Excel'
  },
  {
    id: 5,
    reportName: 'Employee Productivity',
    category: 'HR',
    createdBy: 'David Kim',
    createdDate: '2023-07-05',
    lastModified: '2023-07-25',
    views: 98,
    downloads: 23,
    status: 'Published',
    format: 'PDF'
  },
  {
    id: 6,
    reportName: 'Financial Forecast',
    category: 'Finance',
    createdBy: 'Lisa Rodriguez',
    createdDate: '2023-01-15',
    lastModified: '2023-07-10',
    views: 321,
    downloads: 112,
    status: 'Published',
    format: 'Excel'
  },
  {
    id: 7,
    reportName: 'Website Analytics',
    category: 'Marketing',
    createdBy: 'Robert Taylor',
    createdDate: '2023-06-12',
    lastModified: '2023-07-22',
    views: 210,
    downloads: 67,
    status: 'Published',
    format: 'PDF'
  },
  {
    id: 8,
    reportName: 'Product Performance',
    category: 'Product',
    createdBy: 'Jennifer Lee',
    createdDate: '2023-05-30',
    lastModified: '2023-07-15',
    views: 156,
    downloads: 48,
    status: 'Archived',
    format: 'Excel'
  },
];

// Column definition type without GridColDef
interface Column {
  field: string;
  headerName: string;
  width: number;
  sortable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}

const ReportsDetailsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Report>('reportName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setCategoryFilter([]);
    setStatusFilter([]);
    setFormatFilter([]);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((n) => n.id);
      setSelectedRows(newSelected);
      return;
    }
    setSelectedRows([]);
  };

  const handleCheckboxClick = (id: number) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter(rowId => rowId !== id);
    }

    setSelectedRows(newSelected);
  };

  const handleRequestSort = (property: keyof Report) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = (id: number) => selectedRows.indexOf(id) !== -1;

  // Sort function
  const sortData = (data: Report[]) => {
    return data.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (order === 'desc') {
        if (bValue < aValue) return -1;
        if (bValue > aValue) return 1;
      } else {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
      }
      return 0;
    });
  };

  const filteredData = reportData.filter((report) => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.createdBy.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(report.category);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(report.status);
    const matchesFormat = formatFilter.length === 0 || formatFilter.includes(report.format);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesFormat;
  });

  const sortedData = sortData(filteredData);
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalRows = filteredData.length;
  const totalColumns = 9; // Manually count the columns excluding actions
  const totalViews = filteredData.reduce((sum, report) => sum + report.views, 0);
  const totalDownloads = filteredData.reduce((sum, report) => sum + report.downloads, 0);

  const columns: Column[] = [
    { 
      field: 'reportName', 
      headerName: 'Report Name', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium' }}>{params.value}</Box>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ 
            backgroundColor: '#f0f7ff',
            color: '#1976d2',
            fontWeight: 500
          }}
        />
      )
    },
    { field: 'createdBy', headerName: 'Created By', width: 150 },
    { field: 'createdDate', headerName: 'Created Date', width: 150 },
    { field: 'lastModified', headerName: 'Last Modified', width: 150 },
    { 
      field: 'views', 
      headerName: 'Views', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'downloads', 
      headerName: 'Downloads', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2196f3' }} />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => {
        let color = '';
        switch(params.value) {
          case 'Published': color = '#4caf50'; break;
          case 'Draft': color = '#ff9800'; break;
          case 'Archived': color = '#9e9e9e'; break;
          default: color = '#1976d2';
        }
        return (
          <Chip 
            label={params.value} 
            size="small" 
            sx={{ 
              backgroundColor: `${color}20`,
              color: color,
              fontWeight: 500
            }}
          />
        );
      }
    },
    { field: 'format', headerName: 'Format', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: () => (
        <IconButton size="small">
          <MoreIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search reports..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchText('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              multiple
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Category"
              IconComponent={ArrowDropDownIcon}
            >
              {Array.from(new Set(reportData.map(r => r.category))).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Status"
              IconComponent={ArrowDropDownIcon}
            >
              {['Published', 'Draft', 'Archived'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Format</InputLabel>
            <Select
              multiple
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Format"
              IconComponent={ArrowDropDownIcon}
            >
              {['PDF', 'Excel'].map((format) => (
                <MenuItem key={format} value={format}>
                  {format}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={!searchText && categoryFilter.length === 0 && statusFilter.length === 0 && formatFilter.length === 0}
            sx={{ ml: 'auto' }}
          >
            Clear
          </Button>

          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <DownloadIcon sx={{ mr: 1 }} /> Export All
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ShareIcon sx={{ mr: 1 }} /> Share View
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <RefreshIcon sx={{ mr: 1 }} /> Refresh Data
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Total Reports</Typography>
            <Typography variant="h5" fontWeight="bold">{totalRows}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Columns</Typography>
            <Typography variant="h5" fontWeight="bold">{totalColumns}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Total Views</Typography>
            <Typography variant="h5" fontWeight="bold">{totalViews}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Total Downloads</Typography>
            <Typography variant="h5" fontWeight="bold">{totalDownloads}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Selected</Typography>
            <Typography variant="h5" fontWeight="bold">{selectedRows.length}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                    checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell 
                    key={column.field}
                    style={{ width: column.width }}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.field}
                        direction={orderBy === column.field ? order : 'asc'}
                        onClick={() => handleRequestSort(column.field as keyof Report)}
                      >
                        {column.headerName}
                      </TableSortLabel>
                    ) : (
                      column.headerName
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => {
                const isItemSelected = isSelected(row.id);
                
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={() => handleCheckboxClick(row.id)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${column.field}`}>
                        {column.renderCell ? 
                          column.renderCell({ value: row[column.field as keyof Report], row }) : 
                          row[column.field as keyof Report]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ReportsDetailsPage;