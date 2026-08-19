export default function decorate(block) {
  const items = [...block.children];

  if (!items.length) return;

  const titleWrapper = document.createElement('div');
  titleWrapper.className = 'brands-header';

  const grid = document.createElement('div');
  grid.className = 'brands-grid';

  items.forEach((item) => {
    const isBrand = item.dataset.aueComponent === 'brand';

    if (!isBrand) {
      if (!titleWrapper.children.length) {
        titleWrapper.appendChild(item);
      }
      return;
    }

    item.classList.add('brand-card');

    const image = item.querySelector('img');
    const picture = image?.closest('picture');

    if (!image || !picture) {
      grid.appendChild(item);
      return;
    }

    image.classList.add('brand-logo');

    // Find any authored URL
    const authoredLink = item.querySelector('a[href]');

    const href = authoredLink?.getAttribute('href')?.trim();

    // Create a clean wrapper
    const contentWrapper = document.createElement('div');

    if (href) {
      const link = document.createElement('a');

      link.href = href;
      link.className = 'brand-card-link';

      link.appendChild(picture);
      contentWrapper.appendChild(link);
    } else {
      contentWrapper.appendChild(picture);
    }

    // Remove everything currently inside the card
    item.innerHTML = '';

    // Add only our clean structure
    item.appendChild(contentWrapper);

    grid.appendChild(item);
  });

  block.innerHTML = '';

  if (titleWrapper.children.length) {
    block.appendChild(titleWrapper);
  }

  block.appendChild(grid);
}