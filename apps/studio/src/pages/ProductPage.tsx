import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findProduct, productModules } from '../features/catalog/catalog';
import type { ProductDefinition } from '../features/configurator/contracts';
import { assetUrl, legacyViewerUrl } from '../shared/urls';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = findProduct(slug ?? '');
  const [definition, setDefinition] = useState<ProductDefinition | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setDefinition(null);
    setLoadError(false);
    if (!product) return;
    void productModules[product.id]().then(({ definition: next }) => {
      if (active) setDefinition(next);
    }).catch(() => {
      if (active) setLoadError(true);
    });
    return () => { active = false; };
  }, [product]);

  if (!product) return <main id="main-content" className="container page-lead"><h1>We couldn't find this product.</h1><Link to="/collection">Return to collection</Link></main>;

  return <main id="main-content" className="product-page container">
    <Link to="/collection" className="back-link">← Collection</Link>
    <div className="product-detail">
      <div className="product-detail-photo"><img src={assetUrl(`assets/${product.image}`)} alt={product.imageAlt} decoding="async"/></div>
      <div className="product-detail-content">
        <span className="product-family">{product.family}</span>
        <h1>{product.feature}</h1>
        <p className="detail-lead">{product.description}</p>
        <p className="detail-note">Explore the current interactive model with real-time options, assembly animations and component inspection. This existing viewer stays available while we build the new modular studio.</p>
        <a className="button button-dark" href={legacyViewerUrl(product.legacyFile)}>Open interactive configurator <span aria-hidden="true">↗</span></a>
        <div className="detail-meta"><strong>Studio capabilities</strong>
          {loadError ? <p>Details unavailable. You can still open the interactive viewer.</p> : !definition ? <p aria-live="polite">Loading product details…</p> : <>
            <ul>
              {definition.capabilities.assembly && <li>Assembly animation</li>}
              {definition.capabilities.explodedView && <li>Exploded components</li>}
              {definition.capabilities.componentInspection && <li>Component inspection</li>}
              {definition.capabilities.roomView && <li>Living room preview</li>}
            </ul>
            <p className="concept-caption">Concept visualization · Product schema {definition.schemaVersion}</p>
          </>}
        </div>
      </div>
    </div>
  </main>;
}
