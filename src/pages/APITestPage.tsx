import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

const APITestPage = () => {
  // Test health endpoint
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const { data: health, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: () => fetch(`${apiBaseUrl}/health`).then(res => res.json()),
  });

  // Test products endpoint
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch(`${apiBaseUrl}/api/products`).then(res => res.json()),
  });

  // Test artisans endpoint
  const { data: artisans, isLoading: artisansLoading, error: artisansError } = useQuery({
    queryKey: ['artisans'],
    queryFn: () => fetch('http://localhost:4000/api/artisans').then(res => res.json()),
  });

  const StatusIndicator = ({ isLoading, error, data, label }: any) => (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : error ? (
        <XCircle className="w-4 h-4 text-red-500" />
      ) : data ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-yellow-500" />
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Backend API Connection Test</h1>
          <p className="text-muted-foreground">
            Testing connection to our Zaymazone backend server
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Health Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIndicator 
                  isLoading={healthLoading} 
                  error={healthError} 
                  data={health} 
                  label="Health Check"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthError ? (
                <div className="text-sm text-red-600">
                  Error: {healthError.message}
                </div>
              ) : health ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Server Online
                </Badge>
              ) : (
                <div className="text-muted-foreground">Checking...</div>
              )}
            </CardContent>
          </Card>

          {/* Products API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIndicator 
                  isLoading={productsLoading} 
                  error={productsError} 
                  data={products} 
                  label="Products API"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsError ? (
                <div className="text-sm text-red-600">
                  Error: {productsError.message}
                </div>
              ) : products ? (
                <div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-2">
                    {products.pagination?.total || products.length} Products
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Categories: {products.products ? 
                      [...new Set(products.products.map((p: any) => p.category))].length : 0}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Loading...</div>
              )}
            </CardContent>
          </Card>

          {/* Artisans API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIndicator 
                  isLoading={artisansLoading} 
                  error={artisansError} 
                  data={artisans} 
                  label="Artisans API"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {artisansError ? (
                <div className="text-sm text-red-600">
                  Error: {artisansError.message}
                </div>
              ) : artisans ? (
                <div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 mb-2">
                    {artisans.length} Artisans
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Locations: {[...new Set(artisans.map((a: any) => a.location.city))].length}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Loading...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sample Data Display */}
        {products && products.products && products.products.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sample Product Data</CardTitle>
              <CardDescription>First product from the backend</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(products.products[0], null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.reload()}>
            Refresh Tests
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('http://localhost:4000', '_blank')}
          >
            View API Docs
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default APITestPage;