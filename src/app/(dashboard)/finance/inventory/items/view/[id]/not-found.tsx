import React from 'react';
import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full">
          <CardContent className="text-center py-12">
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/finance/inventory/items">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Items
                </Link>
              </Button>
              <Button asChild>
                <Link href="/finance/inventory/items/create">
                  Create New Item
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
