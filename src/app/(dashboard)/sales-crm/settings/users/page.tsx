'use client';

import { useState, useEffect, useRef } from 'react';
// import ConfirmationDialog from '@/components/ConfirmationDialog';
import useUserStore from '@/stores/salesCrmStore/useUserStore';
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import ConfirmationDialog from '@/components/sales-crm/ConfirmationDialog';

export default function UsersPage() {
  const { users, loading, error, fetchUsers, addUser, updateUserData, toggleUserStatus, removeUser } = useUserStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    userType: 'USER',
  });
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);
  const actionPopoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUsers('USER', currentPage, itemsPerPage);
  }, [fetchUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionPopoverRef.current &&
        !actionPopoverRef.current.contains(event.target as Node)
      ) {
        setActionDropdownOpen(null);
      }
    }
    if (actionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionDropdownOpen]);

  const handleAddUser = async () => {
    try {
      await addUser(newUser);
      await fetchUsers('USER', currentPage, itemsPerPage);
      setIsAddDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        mobile: '',
        password: '',
        userType: 'USER',
      });
    } catch (e) {
      // Optionally handle error
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id, !currentStatus);
      await fetchUsers('USER', currentPage, itemsPerPage);
      toast.success('User status changed successfully');
    } catch (error) {
      toast.error('Unable to change user status ');
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await removeUser(userToDelete);
        await fetchUsers('USER', currentPage, itemsPerPage);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load users</h3>
          <p className="text-gray-500">Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Users Management</h1>
          <div className="flex items-center gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Add New User
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Get started by adding a new user.</p>
        </div>
        {isAddDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New User</h2>
                <button 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newUser.mobile}
                    onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.userType}
                    onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <button
                  onClick={handleAddUser}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Mobile', accessor: 'mobile' },
    { header: 'Role', accessor: 'userType' },
    { header: 'Status', accessor: 'isActive' },
    { header: 'Created At', accessor: 'createdAt' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const renderRow = (user: any, idx: number) => (
    <tr
      key={user._id}
      className="group hover:bg-gray-50/70 transition-colors duration-150"
    >
      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
      <td className="px-6 py-4 text-gray-700">{user.email}</td>
      <td className="px-6 py-4 text-gray-700">{user.mobile}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.userType === 'ADMIN' 
            ? 'bg-indigo-100 text-indigo-800' 
            : user.userType === 'MANAGER' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.userType}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4 relative">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors group-hover:opacity-100"
              aria-label="Actions"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0" align="end">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => handleToggleStatus(user._id, user.isActive)}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => handleDeleteClick(user._id)}
            >
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </td>
    </tr>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <div className="flex items-center gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Add New User
          </button>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="pb-2 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-2xl">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider first:rounded-tl-xl last:rounded-tr"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => renderRow(user, idx))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Get started by adding a new user.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing page {currentPage} of users
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={users.length < itemsPerPage}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add User Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter mobile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.userType}
                  onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <button
                onClick={handleAddUser}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        show={isDeleteDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        disableConfirm={loading}
      />
    </div>
  );
}