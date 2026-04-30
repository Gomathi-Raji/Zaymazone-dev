import fs from 'fs/promises'
import path from 'path'

const ROUTE_BASE_PATHS = {
  'admin-approvals.js': '/api/admin-approvals',
  'admin.js': '/api/admin',
  'addresses.js': '/api/addresses',
  'artisans.js': '/api/artisans',
  'auth.js': '/api/auth',
  'blog.js': '/api/blog',
  'cart.js': '/api/cart',
  'firebase-auth.js': '/api/firebase-auth',
  'images.js': '/api/images',
  'onboarding.js': '/api/onboarding',
  'orders.js': '/api/orders',
  'payments.js': '/api/payments',
  'paytmPayments.js': '/api/payments/paytm',
  'products.js': '/api/products',
  'reviews.js': '/api/reviews',
  'seller-onboarding.js': '/api/seller-onboarding',
  'seller.js': '/api/seller',
  'users.js': '/api/users',
  'verify.js': '/api/verify',
  'wishlist.js': '/api/wishlist',
}

const EXTRA_PATHS = [
  { method: 'get', path: '/', summary: 'API information' },
  { method: 'get', path: '/health', summary: 'Health check' },
  { method: 'post', path: '/api/seed', summary: 'Seed the database' },
]

const METHOD_ORDER = new Set(['get', 'post', 'put', 'patch', 'delete'])

const COMMON_RESPONSES = {
  '200': { description: 'Success' },
  '201': { description: 'Created' },
  '400': { description: 'Bad Request' },
  '401': { description: 'Unauthorized' },
  '403': { description: 'Forbidden' },
  '404': { description: 'Not Found' },
  '409': { description: 'Conflict' },
  '500': { description: 'Internal Server Error' },
}

const GENERIC_JSON_REQUEST = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
}

const MULTIPART_REQUEST = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
}

const JSON_OR_FORM_REQUEST = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    },
    'application/x-www-form-urlencoded': {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
}

const SPECIFIC_REQUEST_BODIES = {
  'POST /api/auth/signup': {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
      },
    },
  },
  'POST /api/auth/signin': {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
      },
    },
  },
  'POST /api/admin/auth/login': {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@zaymazone.com' },
            password: { type: 'string', example: 'admin123' },
          },
        },
      },
    },
  },
  'POST /api/orders': {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['items', 'shippingAddress', 'paymentMethod'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', example: 'product_id' },
                  quantity: { type: 'integer', example: 1 },
                },
              },
            },
            shippingAddress: {
              type: 'object',
              additionalProperties: true,
            },
            paymentMethod: { type: 'string', example: 'cod' },
          },
        },
      },
    },
  },
  'POST /api/payments/create-order': {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      },
    },
  },
  'PATCH /api/admin/comments/bulk-moderate': {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['commentIds', 'status'],
          properties: {
            commentIds: {
              type: 'array',
              items: { type: 'string' },
            },
            status: {
              type: 'string',
              enum: ['approved', 'rejected', 'spam'],
            },
            reason: { type: 'string' },
          },
        },
      },
    },
  },
  'POST /api/images/upload': MULTIPART_REQUEST,
  'POST /api/seller-onboarding': MULTIPART_REQUEST,
  'POST /api/payments/webhook': JSON_OR_FORM_REQUEST,
  'POST /api/paytmPayments/callback': JSON_OR_FORM_REQUEST,
}

const SCHEMA_OVERRIDES = {
  'get /api/admin/comments/stats': {
    '200': {
      description: 'Comment statistics',
    },
  },
}

function humanizeSegment(segment) {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function toOpenApiPath(basePath, relativePath) {
  const normalizedBase = basePath.replace(/\/+$/, '')
  const normalizedRelative = relativePath === '/' ? '' : relativePath.replace(/^\/+/, '')
  const combined = normalizedRelative ? `${normalizedBase}/${normalizedRelative}` : normalizedBase

  return combined.replace(/:([^/]+)/g, '{$1}').replace(/\/+/g, '/')
}

function buildPathParameters(openApiPath) {
  return [...openApiPath.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }))
}

function buildSummary(method, openApiPath) {
  if (openApiPath === '/') return 'API information'
  if (openApiPath === '/health') return 'Health check'

  const segments = openApiPath.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] || ''

  if (lastSegment.startsWith('{')) {
    return `${method.toUpperCase()} ${openApiPath}`
  }

  return `${method.toUpperCase()} ${humanizeSegment(lastSegment)}`
}

function buildRequestBody(method, openApiPath) {
  const overrideKey = `${method.toUpperCase()} ${openApiPath}`
  if (SPECIFIC_REQUEST_BODIES[overrideKey]) {
    return SPECIFIC_REQUEST_BODIES[overrideKey]
  }

  if (method === 'get' || method === 'delete') {
    return undefined
  }

  return GENERIC_JSON_REQUEST
}

function buildSecurity(sourceSnippet) {
  if (/requireAuth|authenticateToken|requireAdmin|requireActiveUser/i.test(sourceSnippet)) {
    return [{ bearerAuth: [] }]
  }

  return undefined
}

function buildOperation({ method, openApiPath, sourceFile, sourceSnippet }) {
  const operation = {
    tags: [humanizeSegment(sourceFile.replace(/\.js$/, ''))],
    summary: buildSummary(method, openApiPath),
    description: `Auto-generated from ${sourceFile}`,
    parameters: buildPathParameters(openApiPath),
    responses: COMMON_RESPONSES,
  }

  const requestBody = buildRequestBody(method, openApiPath)
  if (requestBody) {
    operation.requestBody = requestBody
  }

  const security = buildSecurity(sourceSnippet)
  if (security) {
    operation.security = security
  }

  const overrideKey = `${method.toLowerCase()} ${openApiPath}`
  if (SCHEMA_OVERRIDES[overrideKey]) {
    operation.responses = {
      ...operation.responses,
      ...SCHEMA_OVERRIDES[overrideKey],
    }
  }

  return operation
}

export async function buildOpenApiSpec({ serverUrl = 'http://localhost:4000' } = {}) {
  const routesDir = path.join(process.cwd(), 'src', 'routes')
  const paths = {}
  const tags = []

  for (const [fileName, basePath] of Object.entries(ROUTE_BASE_PATHS)) {
    const filePath = path.join(routesDir, fileName)
    const content = await fs.readFile(filePath, 'utf8')
    const tagName = humanizeSegment(fileName.replace(/\.js$/, ''))

    if (!tags.some((tag) => tag.name === tagName)) {
      tags.push({ name: tagName, description: `Routes defined in ${fileName}` })
    }

    const routePattern = /router\.(get|post|put|patch|delete)\(\s*(?:['"`])([^'"`]+)(?:['"`])/g
    let match

    while ((match = routePattern.exec(content)) !== null) {
      const method = match[1].toLowerCase()
      if (!METHOD_ORDER.has(method)) {
        continue
      }

      const relativePath = match[2]
      const openApiPath = toOpenApiPath(basePath, relativePath)
      const snippet = content.slice(match.index, match.index + 260)

      if (!paths[openApiPath]) {
        paths[openApiPath] = {}
      }

      if (paths[openApiPath][method]) {
        console.warn(`Duplicate Swagger route skipped: ${method.toUpperCase()} ${openApiPath} from ${fileName}`)
        continue
      }

      paths[openApiPath][method] = buildOperation({
        method,
        openApiPath,
        sourceFile: fileName,
        sourceSnippet: snippet,
      })
    }
  }

  for (const extraRoute of EXTRA_PATHS) {
    const openApiPath = extraRoute.path
    if (!paths[openApiPath]) {
      paths[openApiPath] = {}
    }

    if (!paths[openApiPath][extraRoute.method]) {
      paths[openApiPath][extraRoute.method] = {
        tags: ['System'],
        summary: extraRoute.summary,
        description: 'Auto-generated system endpoint',
        responses: COMMON_RESPONSES,
      }
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Zaymazone API',
      version: '1.0.0',
      description: 'OpenAPI documentation for the Zaymazone marketplace backend.',
    },
    servers: [
      {
        url: serverUrl,
        description: 'Current backend server',
      },
    ],
    tags,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  }
}