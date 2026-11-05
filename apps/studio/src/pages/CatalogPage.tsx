import { catalog } from '../features/catalog/catalog';
import { ProductCard } from '../components/ProductCard';

export default function CatalogPage() {
  return <main className="catalog-page container" id="main-content">
    <div className="page-lead">
      <h1>Find the right system.</h1>
      <p>Explore Venetian blinds or choose an insect door for in-reveal or surface mounting. Each product has its own interactive configurator.</p>
    </div>
    <div className="product-grid">
      {catalog.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0}/>)}
    </div>
  </main>;
}
