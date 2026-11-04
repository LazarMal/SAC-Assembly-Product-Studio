import { catalog } from '../features/catalog/catalog';
import { ProductCard } from '../components/ProductCard';

export default function CatalogPage() {
  return <main className="catalog-page container" id="main-content">
    <div className="page-lead"><h1>A considered collection.</h1><p>Choose a system to explore its finishes, moving parts and construction. Each viewer opens the existing interactive demonstrator while the modular engine is migrated.</p></div>
    <div className="product-grid">{catalog.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0}/>)}</div>
  </main>;
}
