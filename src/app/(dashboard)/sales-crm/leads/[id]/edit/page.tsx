"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLeadsStore } from '@/stores/salesCrmStore/useLeadsStore';
import { useAuthStore } from '@/stores/salesCrmStore/useAuthStore';
import type { CreateLeadRequest } from '@/api/leadsApi';
import ConfirmationDialog from '@/components/sales-crm/ConfirmationDialog';
import {
  Business,
  Person,
  Email,
  Phone,
  Smartphone,
  Public,
  Work,
  LocationOn,
  ArrowBack,
  Save
} from '@mui/icons-material';
import { useRoleBasedRouter } from '@/hooks/useRoleBasedRouter';



const EditLeadPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { currentLead, fetchLeadById, updateLead, isLoading, error: storeError } = useLeadsStore();
  const [error, setError] = React.useState<string | null>(null);
  const { pushToRolePath } = useRoleBasedRouter();
    const { user } = useAuthStore();

  // Helper function to convert DD/MM/YYYY to ISO date string
  const convertDateToISO = (dateString: string): string => {
    try {
      // Check if it's already in YYYY-MM-DD format
      if (dateString.includes('-') && dateString.length === 10) {
        return dateString;
      }
      
      // Handle DD/MM/YYYY format
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toISOString();
      }
      
      // Try to parse as a regular date
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error('Error converting date:', error);
      return '';
    }
  };

  // Helper function to convert ISO date to YYYY-MM-DD for input display
  const formatDateForInput = (dateString: string): string => {
    try {
      if (!dateString) return '';
      
      // If it's DD/MM/YYYY format, convert it first
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // If it's already an ISO string, extract the date part
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };
  
  // Confirmation dialog state
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [pendingChange, setPendingChange] = React.useState<{
    field: string;
    value: string;
    fieldLabel: string;
    oldValue: string;
  } | null>(null);

  const industryOptions = ['IT', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Other'];
    const leadSourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Email Marketing', label: 'Email Marketing' },
    { value: 'Cold Call', label: 'Cold Call' },
    { value: 'Advertisement', label: 'Advertisement' },
    { value: 'Event', label: 'Event' },
    { value: 'Direct', label: 'Direct' },
    { value: 'Other', label: 'Other' }
  ];
  const leadStatusOptions = [
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Follow Up Scheduled', label: 'Follow Up Scheduled' },
    { value: 'Interested', label: 'Interested' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Converted', label: 'Converted' },
    { value: 'Not Interested', label: 'Not Interested' },
    { value: 'Unreachable', label: 'Unreachable' },
    { value: 'Disqualified', label: 'Disqualified' }
  ];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = [
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' }
  ];

  const [formData, setFormData] = React.useState<CreateLeadRequest>({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    industry: 'Other',
    source: 'Other',
    status: 'New',
    priority: 'Medium',
    temperature: 'Warm',
    followUpDate: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    socialProfiles: {
      facebook: '',
      instagram: '',
      linkedIn: '',
      twitter: ''
    }
  });

  // Fetch lead data when component mounts
  React.useEffect(() => {
    const loadLead = async () => {
      if (id && user?.companyId) {
        try {
          await fetchLeadById(id, user.companyId);
        } catch (error) {
          console.error('Error loading lead:', error);
          setError('Failed to load lead data');
        }
      } else if (id && !user?.companyId) {
        setError('Company ID is required to load lead data');
      }
    };
    loadLead();
  }, [id, user?.companyId, fetchLeadById]);

  // Update form data when lead is fetched
  React.useEffect(() => {
    if (currentLead) {
      setFormData({
        firstName: currentLead.firstName || '',
        lastName: currentLead.lastName || '',
        companyName: currentLead.companyName || '',
        email: currentLead.email || '',
        phone: currentLead.phone || '',
        industry: currentLead.industry || 'Other',
        source: currentLead.source || 'Other',
        status: currentLead.status || 'New',
        priority: currentLead.priority || 'Medium',
        temperature: currentLead.temperature || 'Warm',
        followUpDate: currentLead.followUpDate ? convertDateToISO(currentLead.followUpDate) : '',
        address: {
          street: currentLead.address?.street || '',
          city: currentLead.address?.city || '',
          state: currentLead.address?.state || '',
          postalCode: currentLead.address?.postalCode || '',
          country: currentLead.address?.country || ''
        },
        socialProfiles: {
          facebook: currentLead.socialProfiles?.facebook || '',
          instagram: currentLead.socialProfiles?.instagram || '',
          linkedIn: currentLead.socialProfiles?.linkedIn || '',
          twitter: currentLead.socialProfiles?.twitter || ''
        }
      });
    }
  }, [currentLead]);

  // Helper function to get field label
  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'source':
        return 'Lead Source';
      case 'status':
        return 'Lead Status';
      case 'priority':
        return 'Priority';
      case 'temperature':
        return 'Temperature';
      default:
        return field;
    }
  };

  // Helper function to get display value
  const getDisplayValue = (field: string, value: string) => {
    switch (field) {
      case 'leadStatus':
        const statusOption = leadStatusOptions.find(option => option.value === value);
        return statusOption ? statusOption.label : value;
      case 'status':
        const statusOpt = statusOptions.find(option => option.value === value);
        return statusOpt ? statusOpt.label : value;
      default:
        return value;
    }
  };

  // Check if field requires confirmation
  const requiresConfirmation = (field: string) => {
    return ['source', 'status', 'priority', 'temperature'].includes(field);
  };

  // Handle field changes with confirmation for specific fields
  const handleChange = (field: string, value: string) => {
    // Check if this field requires confirmation and the value is actually changing
    if (requiresConfirmation(field) && currentLead && formData[field as keyof typeof formData] !== value) {
      const oldValue = formData[field as keyof typeof formData] as string;
      setPendingChange({
        field,
        value,
        fieldLabel: getFieldLabel(field),
        oldValue
      });
      setShowConfirmationDialog(true);
      return;
    }

    // Apply change directly for non-confirmation fields or when no change detected
    applyChange(field, value);
  };

  // Apply the actual change to form data
  const applyChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'address') {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address!,
            [child]: value
          }
        }));
      } else if (parent === 'socialProfiles') {
        setFormData((prev) => ({
          ...prev,
          socialProfiles: {
            ...prev.socialProfiles!,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle confirmation dialog confirm
  const handleConfirmChange = () => {
    if (pendingChange) {
      applyChange(pendingChange.field, pendingChange.value);
    }
    setShowConfirmationDialog(false);
    setPendingChange(null);
  };

  // Handle confirmation dialog cancel
  const handleCancelChange = () => {
    setShowConfirmationDialog(false);
    setPendingChange(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Get companyId - either from form data, context, or localStorage
      const companyId = user?.companyId|| '';
      
      if (!companyId) {
        throw new Error("Company ID is required to update lead details");
      }
      
      // Prepare form data with proper date formatting
      const submitData = { ...formData };
      
      // Remove empty fields to avoid sending unnecessary data
      Object.keys(submitData).forEach(key => {
        const value = submitData[key as keyof typeof submitData];
        if (value === '' || value === null || value === undefined) {
          delete submitData[key as keyof typeof submitData];
        }
      });
      
      // Handle nested objects (address and socialProfiles)
      if (submitData.address) {
        const addressKeys = Object.keys(submitData.address);
        const hasAddressData = addressKeys.some(key => submitData.address![key as keyof typeof submitData.address] !== '');
        if (!hasAddressData) {
          delete submitData.address;
        }
      }
      
      if (submitData.socialProfiles) {
        const socialKeys = Object.keys(submitData.socialProfiles);
        const hasSocialData = socialKeys.some(key => submitData.socialProfiles![key as keyof typeof submitData.socialProfiles] !== '');
        if (!hasSocialData) {
          delete submitData.socialProfiles;
        }
      }
      
      // Ensure followUpDate is properly formatted or removed if empty
      if (submitData.followUpDate) {
        // If followUpDate exists, ensure it's a proper ISO string
        try {
          // Convert to ISO format if it's not already
          if (typeof submitData.followUpDate === 'string') {
            submitData.followUpDate = new Date(submitData.followUpDate).toISOString();
          }
        } catch (dateError) {
          console.error('Invalid date format:', submitData.followUpDate);
          delete submitData.followUpDate; // Remove invalid date
        }
      } else {
        // Remove empty followUpDate to avoid validation errors
        delete submitData.followUpDate;
      }
      
      await updateLead(id, submitData, companyId);
      // Redirect back to the lead details page
      pushToRolePath(`/sales-crm/leads/${id}`)
    } catch (error: any) {
      setError(error?.message || 'Failed to update lead. Please try again.');
      console.error('Error updating lead:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Failed to load lead: {storeError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Edit Lead</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white  shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Person className="w-5 h-5 mr-2 text-indigo-600" />
                Personal Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    placeholder="Enter last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                    placeholder="Enter phone number"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Business className="w-5 h-5 mr-2 text-indigo-600" />
                Professional Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.companyName || ''}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    required
                  />
                </div>
                
              
                
               
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    required
                  >
                    <option value="">Select Industry</option>
                    {industryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                    required
                  >
                    <option value="">Select Source</option>
                    {leadSourceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Status <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    {leadStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    {priorityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow Up Date <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.followUpDate ? formatDateForInput(formData.followUpDate) : ''}
                    onChange={(e) => handleChange('followUpDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <LocationOn className="w-5 h-5 mr-2 text-indigo-600" />
                Address Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.address?.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.address?.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.address?.state}
                    onChange={(e) => handleChange('address.state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.address?.postalCode}
                    onChange={(e) => handleChange('address.postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.address?.country}
                    onChange={(e) => handleChange('address.country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Public className="w-5 h-5 mr-2 text-indigo-600" />
                Social Media Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.socialProfiles?.facebook || ''}
                    onChange={(e) => handleChange('socialProfiles.facebook', e.target.value)}
                    placeholder="https://facebook.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.socialProfiles?.instagram || ''}
                    onChange={(e) => handleChange('socialProfiles.instagram', e.target.value)}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.socialProfiles?.linkedIn || ''}
                    onChange={(e) => handleChange('socialProfiles.linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.socialProfiles?.twitter || ''}
                    onChange={(e) => handleChange('socialProfiles.twitter', e.target.value)}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={showConfirmationDialog}
        title="Confirm Field Change"
        message={
          pendingChange
            ? `Are you sure you want to change ${pendingChange.fieldLabel} from "${getDisplayValue(pendingChange.field, pendingChange.oldValue)}" to "${getDisplayValue(pendingChange.field, pendingChange.value)}"?`
            : ''
        }
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
      />
    </div>
  );
};

export default EditLeadPage;
