import { Link } from 'react-router-dom';
import { catalog } from '../features/catalog/catalog';
import { ProductCard } from '../components/ProductCard';
import { LightStory } from '../features/home/LightStory';

export default function HomePage() {
  return (
    <main id="main-content">
      <LightStory />
      <section className="home-intro container">
        <h2>Know exactly what you're choosing.</h2>
        <p>Compare three systems, try different finishes, and inspect the components that make them work. All in one place.</p>
      </section>
      <section className="catalog-section container" aria-labelledby="collection-title">
        <div className="section-heading">
          <div>
            <h2 id="collection-title">Choose your system.</h2>
            <p>Venetian blinds. In-reveal and surface-mounted insect doors.</p>
          </div>
          <Link className="text-link" to="/collection">See all products <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="product-grid">
          {catalog.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
        </div>
      </section>
      <section className="outro-panel">
        <div className="container outro-content">
          <h2>Every component.<br/>In its place.</h2>
          <p>Explore the frame, guides, controls and finishes before you make a selection. The product configurators show how each choice changes the system.</p>
          <Link className="button button-light" to="/collection">Open the product collection <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </main>
  );
}
