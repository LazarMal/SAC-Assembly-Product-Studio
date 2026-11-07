/** Preview-only navigation transform; never edit the original production HTML files. */
export function rewriteLegacyNavigation(html, base) {
  const prefix = base.endsWith('/') ? base : base + '/';
  const routes = {
    index: '',
    venetian: 'products/venetian-blinds',
    'insect-door': 'products/idd-insect-doors',
    'odd-door': 'products/odd-insect-doors'
  };
  return html
    .replace(/(<a\b[^>]*class=["'][^"']*\bshared-index\b[^"']*["'][^>]*href=["'])\.\/index\.html(["'])/gi,
      (_, before, after) => before + prefix + 'collection' + after)
    .replace(/\bhref=(["'])\.\/(index|venetian|insect-door|odd-door)\.html\1/gi,
      (_, quote, name) => 'href=' + quote + prefix + routes[name.toLowerCase()] + quote);
}
