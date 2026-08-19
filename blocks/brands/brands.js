export default function decorate(block) {
  const items = [...block.children];

  if (!items.length) return;

  const titleWrapper = document.createElement('div');
  titleWrapper.className = 'brands-header';

  const grid = document.createElement('div');
  grid.className = 'brands-grid';

  items.forEach((item) => {
    const image = item.querySelector('img');

    // Brand card
    if (image) {
      item.classList.add('brand-card');

      image.classList.add('brand-logo');

      const picture = image.closest('picture');

      // Get URL from the authored link
      const linkField = item.querySelector('p a');

      if (picture && linkField) {
        const href = linkField.href;

        const link = document.createElement('a');
        link.href = href;
        link.className = 'brand-card-link';

        // Replace picture wrapper with link
        picture.parentElement.replaceWith(link);

        // Put picture inside link
        link.appendChild(picture);
      }

      // Remove URL text/container
      const urlContainer = item.querySelector('p');

      if (urlContainer) {
        urlContainer.parentElement.remove();
      }

      grid.appendChild(item);
    } else {
      // Heading
      if (!titleWrapper.children.length) {
        titleWrapper.appendChild(item);
      }
    }
  });

  // Rebuild block
  block.innerHTML = '';

  if (titleWrapper.children.length) {
    block.appendChild(titleWrapper);
  }

  block.appendChild(grid);
}