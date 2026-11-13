/**
 * Preview-only, shared product navigation for the four standalone viewers.
 * The original root configurators are never modified.
 */
const paths = {
  collection: 'collection',
  venetian: 'products/venetian-blinds',
  idd: 'products/idd-insect-doors',
  odd: 'products/odd-insect-doors',
  roller: 'products/open-roller-blind'
};
const titles = {
  collection: 'Collection',
  venetian: 'Venetian blinds',
  idd: 'IDD doors',
  odd: 'ODD doors',
  roller: 'Roller blinds'
};

const css = `
<style id="sac-unified-product-navigation">
/* Match the centered IDD/ODD product header across all four viewers. */
html body header.shared-header, html body header.topbar {
  position:relative!important;min-height:70px!important;height:70px!important;
  box-sizing:border-box!important;display:flex!important;align-items:center!important;
  justify-content:space-between!important;padding:0 clamp(16px,3.1vw,45px)!important;
}
html body header.shared-header>.sac-product-nav, html body header.topbar>.sac-product-nav {
  position:absolute!important;top:50%!important;left:50%!important;right:auto!important;
  transform:translate(-50%,-50%)!important;width:max-content!important;height:auto!important;
  max-width:calc(100% - 230px)!important;margin:0!important;padding:0!important;
  display:flex!important;flex-direction:row!important;justify-content:center!important;
  align-items:center!important;gap:4px!important;white-space:nowrap!important;
  flex-wrap:nowrap!important;overflow:visible!important;
}
html body header .sac-product-nav a {
  display:inline-flex!important;flex:0 0 auto!important;justify-content:center!important;
  align-items:center!important;min-height:39px!important;
  padding:10px clamp(8px,1.1vw,16px)!important;
  font:600 13px/1.1 Arial,Helvetica,sans-serif!important;letter-spacing:0!important;
  border:0!important;border-radius:999px!important;background:transparent!important;
  color:#e7ddd2!important;text-decoration:none!important;opacity:1!important;visibility:visible!important;
}
html body header .sac-product-nav a:hover, html body header .sac-product-nav a:focus-visible {
  background:#ffffff18!important;color:#fff!important;
}
html body header .sac-product-nav a[aria-current="page"] {
  background:#e8d3bc!important;color:#3f3024!important;font-weight:750!important;
}
@media(max-width:1030px) {
  html body header.shared-header, html body header.topbar {
    height:auto!important;min-height:100px!important;padding:8px 12px!important;
    flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:3px!important;
  }
  html body header.shared-header>a, html body header.topbar>a {
    flex:0 0 auto!important;align-self:flex-start!important;min-height:32px!important;
    display:inline-flex!important;align-items:center!important;
  }
  html body header.shared-header>.sac-product-nav, html body header.topbar>.sac-product-nav {
    position:relative!important;left:auto!important;right:auto!important;top:auto!important;
    transform:none!important;width:100%!important;max-width:100%!important;
    overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important;
    justify-content:center!important;gap:4px!important;height:42px!important;flex:0 0 42px!important;
  }
  html body header .sac-product-nav::-webkit-scrollbar{display:none!important}
  html body header .sac-product-nav a {min-height:39px!important;padding:8px 11px!important;font-size:12px!important}
}
@media(max-width:580px) {
  html body header.shared-header>.sac-product-nav, html body header.topbar>.sac-product-nav {
    flex-wrap:wrap!important;overflow:visible!important;height:auto!important;flex-basis:auto!important;gap:2px!important;
  }
  html body header .sac-product-nav a {font-size:11px!important;min-height:36px!important;padding:8px 7px!important}
  html body header .sac-product-nav a[data-product-link="collection"] {display:none!important}
}
</style>`;

export function unifyProductNavigation(html, active, base = '../#/') {
  if (!(active in paths) || active === 'collection') throw new Error('Unknown product: ' + active);
  if (!html.includes('</head>') || html.includes('id="sac-unified-product-navigation"')) {
    throw new Error('Cannot add unified navigation: missing head or already transformed');
  }
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const nav = '<nav aria-label="Products" class="sac-product-nav">' +
    Object.keys(paths).map(id => {
      const selected = id === active;
      return `<a data-product-link="${id}" href="${prefix}${paths[id]}"${selected ? ' class="current" aria-current="page"' : ''}>${titles[id]}</a>`;
    }).join('') + '</nav>';
  // Only the top-level product navigation is replaced. Configure/Components/Assembly stays untouched.
  const selector = active === 'roller'
    ? /<nav\b[^>]*class="primary-nav"[^>]*>[\s\S]*?<\/nav>/
    : /<nav\b[^>]*class="shared-links"[^>]*>[\s\S]*?<\/nav>/;
  if (!selector.test(html)) throw new Error('Product navigation not found: ' + active);
  return html.replace(selector, nav).replace('</head>', css + '</head>');
}
