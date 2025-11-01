import { Metadata } from 'next';

export function generateSlug(name: string, id?: string): string {
  // Convert to lowercase and replace spaces with hyphens
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Add unique identifier to prevent conflicts
  if (id) {
    slug += `-${id.substring(0, 8)}`;
  }
  
  return slug;
}

export function parseSlug(slug: string): { name: string; id: string } {
  // Extract ID from the end of the slug (last 8 characters after last hyphen)
  const parts = slug.split('-');
  const id = parts[parts.length - 1];
  const name = parts.slice(0, -1).join(' ');
  
  return { name, id };
}

export function generateProductMetadata(product: any): Metadata {
  const title = `${product.name} - Buy Online | MediSwift Pakistan`;
  const description = product.description || `Buy ${product.name} online at best prices in Pakistan. Fast delivery, genuine products, and secure payment options at MediSwift.`;
  
  return {
    title,
    description,
    keywords: [
      product.name,
      'medicine',
      'pharmacy',
      'online pharmacy pakistan',
      'buy medicine online',
      'mediswift',
      product.category?.name,
      ...((product.tags || []) as string[])
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'MediSwift Pakistan',
      images: product.images?.[0] ? [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `/products/${product.slug || product.id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStructuredData(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || [],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'MediSwift',
    },
    offers: product.variants?.map((variant: any) => ({
      '@type': 'Offer',
      price: variant.price,
      priceCurrency: 'PKR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MediSwift Pakistan',
      },
      name: variant.name,
    })) || [],
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      ratingCount: product.ratingCount || 1,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    category: product.category?.name,
    url: `https://mediswift.pk/products/${product.slug || product.id}`,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://mediswift.pk${item.url}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MediSwift Pakistan',
    url: 'https://mediswift.pk',
    logo: 'https://mediswift.pk/logo.png',
    description: 'Your trusted online pharmacy in Pakistan. Buy medicines, healthcare products, and wellness items with fast delivery.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressRegion: 'Punjab',
      addressLocality: 'Lahore',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-300-1234567',
      contactType: 'customer service',
      availableLanguage: ['en', 'ur'],
    },
    sameAs: [
      'https://www.facebook.com/mediswiftpk',
      'https://www.instagram.com/mediswiftpk',
      'https://twitter.com/mediswiftpk',
    ],
  };
}
