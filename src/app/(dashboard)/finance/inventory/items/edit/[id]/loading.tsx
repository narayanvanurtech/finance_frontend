import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const EditItemSkeleton = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-muted rounded-md animate-pulse" />
        <div>
          <div className="w-32 h-6 bg-muted rounded animate-pulse mb-2" />
          <div className="w-48 h-4 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="w-40 h-6 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="w-20 h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div>
              <div className="w-24 h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="w-full h-20 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <div className="w-52 h-6 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="w-24 h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="w-32 h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="w-full h-20 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Physical Properties Card */}
        <Card>
          <CardHeader>
            <div className="w-36 h-6 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="w-16 h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div>
              <div className="w-16 h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="w-full h-10 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Management Card */}
        <Card>
          <CardHeader>
            <div className="w-44 h-6 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="w-48 h-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="w-24 h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div>
              <div className="w-20 h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="w-full h-10 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Card */}
        <Card>
          <CardHeader>
            <div className="w-24 h-6 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 bg-muted rounded-lg animate-pulse" />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <div className="w-20 h-10 bg-muted rounded animate-pulse" />
          <div className="w-32 h-10 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default EditItemSkeleton;
