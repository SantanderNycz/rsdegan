// Otimização das silhuetas SVG (dragão, espada). Mantém viewBox, remove metadados.
/** @type {import('svgo').Config} */
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          // Não colapsar grupos que possam ter semântica de parallax.
          collapseGroups: false,
        },
      },
    },
    { name: 'removeDimensions' },
    'sortAttrs',
  ],
};
