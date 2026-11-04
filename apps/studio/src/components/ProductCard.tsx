import { Link } from 'react-router-dom';
import type { CatalogEntry } from '../features/catalog/types';
import { assetUrl } from '../shared/urls';

export function ProductCard({ product, priority = false }: { product: CatalogEntry; priority?: boolean }) {
  return (
    <Link to={`/products/${product.slug}`} className="product-card" aria-label={`Explore ${product.title}`}>
      <div className="product-card-image">
        <img src={assetUrl(`assets/${product.image}`)} alt={product.imageAlt} loading={priority ? 'eager' : 'lazy'} decoding="async" />
        <span className="product-card-cta" aria-hidden="true">Explore <span>↗</span></span>
      </div>
      <div className="product-card-copy">
        <span className="product-family">{product.family}</span>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
      </div>
    </Link>
  );
}
