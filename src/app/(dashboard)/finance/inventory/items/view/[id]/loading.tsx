import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ViewItemSkeleton = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-md animate-pulse" />
          <div>
            <div className="w-48 h-6 bg-muted rounded animate-pulse mb-2" />
            <div className="w-32 h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-9 bg-muted rounded animate-pulse" />
          <div className="w-20 h-9 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <div className="w-40 h-5 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="w-20 h-3 bg-muted rounded animate-pulse mb-2" />
                    <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <div className="w-48 h-5 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="w-24 h-3 bg-muted rounded animate-pulse mb-2" />
                    <div className="w-28 h-6 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card>
            <CardHeader>
              <div className="w-40 h-5 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="w-20 h-3 bg-muted rounded animate-pulse mb-2" />
                    <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Image Card */}
          <Card>
            <CardHeader>
              <div className="w-24 h-5 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <div className="w-20 h-5 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="w-16 h-3 bg-muted rounded animate-pulse mb-2" />
                  <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewItemSkeleton;
