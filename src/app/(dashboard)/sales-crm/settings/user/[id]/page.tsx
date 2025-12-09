'use client';

import { useAuthStore } from '@/stores/salesCrmStore/useAuthStore';
import { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfilePic } from '@/api/userApi';
import { toast } from 'sonner';
import Image from 'next/image';
import { User } from 'lucide-react';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  status: number;
  profilePic: string | null;
  isActive: boolean;
  userType: string;
  signupStatus: number;
  createdAt: string;
  updatedAt: string;
  companyName?: string;
}

export default function UserSettingsPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    userType: '',
    profilePic: null as string | null,
    companyName: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getProfile(params.id);
        const profileData: ProfileData = response.data;
        setFormData(prev => ({
          ...prev,
          name: profileData.name || '',
          email: profileData.email || '',
          mobile: profileData.mobile || '',
          userType: profileData.userType || '',
          profilePic: profileData.profilePic,
          companyName: profileData.companyName || '',
        }));
        setPreviewImage(profileData.profilePic);
      } catch (error) {
        toast.error('Failed to fetch user profile');
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploadingPic(true);
      const response = await uploadProfilePic(file);
      setPreviewImage(response.data.profilePic);
      setFormData(prev => ({ ...prev, profilePic: response.data.profilePic }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Error uploading profile picture:', error);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        companyName: formData.companyName,
      };
      await updateProfile(params.id, updateData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[93vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-100 my-4 py-4 md:my-0 md:py-0 px-2 md:px-0">
      <div className="max-w-2xl w-full bg-white bg-gradient-to-br from-indigo-50 to-white rounded-3xl shadow-2xl flex flex-col items-center py-8 px-6">
        {/* Profile Image and Name */}
        <div className="flex flex-col items-center mb-6 w-full">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg bg-white flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-5xl font-bold text-indigo-500">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'X'}
                </span>
              )}
              {uploadingPic && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            {!uploadingPic && (
              <label
                htmlFor="profilePic"
                className="absolute bottom-0 right-0 bg-white text-indigo-500 rounded-full p-2 shadow-md cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-100"
                title="Change profile picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingPic}
                />
              </label>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">{formData.name || 'User Name'}</h2>
          <p className="text-gray-500 mb-2">{formData.email}</p>
          <span className="inline-block bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full mb-2">{formData.userType || 'User'}</span>
          {formData.companyName && (
            <div className="flex items-center gap-2 text-indigo-400 text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18" /></svg>
              <span>{formData.companyName}</span>
            </div>
          )}
          <div className="flex flex-col gap-1 text-gray-500 text-sm">
            <span><b>Mobile:</b> {formData.mobile}</span>
          </div>
        </div>
        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4 text-indigo-700">
              <User className="w-5 h-5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-indigo-50"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-indigo-50"
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-indigo-50"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  User Type
                </label>
                <input
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  className="w-full px-4 py-2 border border-indigo-200 rounded-lg bg-indigo-100 cursor-not-allowed text-indigo-400"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold shadow-md transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}