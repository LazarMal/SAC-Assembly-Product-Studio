import { Link } from 'react-router-dom';
import { catalog } from '../features/catalog/catalog';
import { ProductCard } from '../components/ProductCard';
import { assetUrl } from '../shared/urls';

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-image" style={{backgroundImage: `url('${assetUrl('assets/living-room.webp')}')`}} role="img" aria-label="Sunlit living room with a garden-facing window" />
        <div className="hero-content">
          <span className="hero-brand">S.A.C. Assembly</span>
          <h1 id="home-title">A little more <em>room to live.</em></h1>
          <p>Considered window systems that make everyday spaces feel just right.</p>
          <Link className="button button-dark" to="/collection">Explore the collection <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
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
