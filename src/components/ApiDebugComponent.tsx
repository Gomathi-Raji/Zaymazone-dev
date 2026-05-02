import React from 'react';
import { useProducts } from '@/hooks/useProducts';

// Development only - debug component for testing API responses
// Remove or disable in production builds
const ApiDebugComponent = () => {
  // Always call hooks at the top level (React Hooks rule)
  const { data: productsData, isLoading, error } = useProducts({ limit: 1 });

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  if (import.meta.env.DEV) {
    console.log('Products hook result:', { productsData, isLoading, error });
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!productsData?.products?.length) return <div>No products found</div>;

  const product = productsData.products[0];
  if (import.meta.env.DEV) {
    console.log('First product:', product);
    console.log('Product images:', product.images);
  }

  return (
    <div className="p-4 border bg-yellow-50 border-yellow-300 rounded">
      <h3 className="text-sm font-bold text-yellow-900">🔧 API Debug Component (Dev Only)</h3>
      <p><strong>Name:</strong> {product.name}</p>
      <p><strong>ID:</strong> {product.id}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Images:</strong></p>
      <ul>
        {product.images?.map((img, index) => (
          <li key={index}>
            <a href={img} target="_blank" rel="noopener noreferrer">{img}</a>
            <br />
            <img 
              src={img} 
              alt={product.name} 
              style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ccc' }}
              onLoad={() => {
                if (import.meta.env.DEV) {
                  console.log(`Image loaded: ${img}`);
                }
              }}
              onError={() => {
                if (import.meta.env.DEV) {
                  console.error(`Image failed to load: ${img}`);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApiDebugComponent;