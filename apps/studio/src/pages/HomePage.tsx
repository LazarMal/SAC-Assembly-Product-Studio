import { Link } from 'react-router-dom';
import { catalog } from '../features/catalog/catalog';
import { ProductCard } from '../components/ProductCard';
import { LightStory } from '../features/home/LightStory';

export default function HomePage() {
  return (
    <main id="main-content">
      <LightStory />
      <section className="home-intro container">
        <h2>Made for real homes, explored in detail.</h2>
        <p>Discover finishes, understand the construction and picture the product in your space. Every choice should feel considered.</p>
      </section>
      <section className="catalog-section container" aria-labelledby="collection-title">
        <div className="section-heading"><div><h2 id="collection-title">The collection</h2><p>Three systems. A more personal way to explore them.</p></div><Link className="text-link" to="/collection">View all products <span aria-hidden="true">↗</span></Link></div>
        <div className="product-grid">{catalog.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}</div>
      </section>
      <section className="outro-panel"><div className="container outro-content"><h2>Not just how it looks.<br/><em>How it works.</em></h2><p>Move through each system, explore its components and see how the design comes together. The original interactive product viewers remain available while the new studio is developed.</p><Link className="button button-light" to="/collection">Choose a product <span aria-hidden="true">↗</span></Link></div></section>
    </main>
  );
}
