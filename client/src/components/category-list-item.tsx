import React from 'react';
import { Link } from 'wouter';
import { Category } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface CategoryListItemProps {
  category: Category;
}

export function CategoryListItem({ category }: CategoryListItemProps) {
  return (
    <Link href={`/category/${category.id}`}>
      <Card className="cursor-pointer hover:bg-gray-50 transition-colors mb-2">
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{category.icon}</span>
            <div>
              <h3 className="font-medium">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </CardContent>
      </Card>
    </Link>
  );
}