export type ProductLike = {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  artisan?: {
    name?: string;
  } | null;
};

const TEST_KEYWORDS = /(\btest\b|\bmock\b|\bdemo\b|\bpayment testing\b|paytm payment gateway)/i;

export const isTestProduct = (product: ProductLike | null | undefined): boolean => {
  if (!product) return false;

  const name = product.name || '';
  const description = product.description || '';
  const category = product.category || '';
  const artisanName = product.artisan?.name || '';
  const tags = Array.isArray(product.tags) ? product.tags : [];

  return (
    product.id === 'mock-paytm-test-product' ||
    product._id === 'mock-paytm-test-product' ||
    category.toLowerCase() === 'test' ||
    TEST_KEYWORDS.test(name) ||
    TEST_KEYWORDS.test(description) ||
    TEST_KEYWORDS.test(artisanName) ||
    tags.some((tag) => TEST_KEYWORDS.test(tag))
  );
};

export const filterTestProducts = <T extends ProductLike>(products: T[] = []): T[] => {
  return products.filter((product) => !isTestProduct(product));
};

export const filterProductsResponse = <T extends { products?: ProductLike[]; pagination?: { total?: number; totalPages?: number; limit?: number } }>(response: T): T => {
  if (!response.products) return response;

  const filteredProducts = filterTestProducts(response.products);
  const total = filteredProducts.length;
  const limit = response.pagination?.limit || total || 1;

  return {
    ...response,
    products: filteredProducts,
    pagination: response.pagination
      ? {
          ...response.pagination,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        }
      : response.pagination,
  };
};