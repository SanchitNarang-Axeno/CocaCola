import { getMetadata, createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Fetches the raw markup of the footer content page. Unlike the shared
 * `loadFragment` helper, this does not run block/section decoration on the
 * result: the authored `.footer` block inside it would otherwise be
 * decorated (and thus loaded) a second time, recursively.
 * @param {string} path The path to the footer content page
 * @returns {Element} The `.footer` block found in that page, if any
 */
async function loadFooterContent(path) {
  const cleanPath = path.replace(/\.plain\.html$/, '');
  const resp = await fetch(`${cleanPath}.plain.html`);
  if (!resp.ok) return null;
  const main = document.createElement('main');
  main.innerHTML = await resp.text();

  // reset base path for media to the footer page's base, like loadFragment does
  const base = new URL(cleanPath, window.location);
  main.querySelectorAll('img[src^="./media_"]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  main.querySelectorAll('source[srcset^="./media_"]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });

  return main.querySelector('.footer');
}

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Toggles a footer column's expanded state.
 * @param {Element} button The footer column toggle button
 * @param {Boolean} expanded Whether the column should be expanded
 */
function toggleColumn(button, expanded) {
  button.dataset.expanded = expanded;
  const list = button.nextElementSibling;
  if (isDesktop.matches) {
    button.setAttribute('aria-expanded', 'true');
    list.style.height = '';
    return;
  }
  button.setAttribute('aria-expanded', expanded);
  list.style.height = expanded ? `${list.scrollHeight}px` : '0px';
}

/**
 * Builds one accordion column from an authored `footer-column` row.
 * Row fields (in model order): heading, links.
 * @param {Element} row The authored row
 * @param {Number} i The column index, used for a unique id
 * @returns {Element} The decorated `.footer-column`
 */
function buildColumn(row, i) {
  const [headingDiv, linksDiv] = row.children;

  const column = document.createElement('div');
  column.className = 'footer-column';
  moveInstrumentation(row, column);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-column-toggle';
  button.innerHTML = headingDiv?.innerHTML || '';
  moveInstrumentation(headingDiv, button);

  const list = linksDiv?.querySelector('ul') || document.createElement('ul');
  moveInstrumentation(linksDiv, list);
  const listId = `footer-column-${i}`;
  list.id = listId;
  list.classList.add('footer-column-list');
  button.setAttribute('aria-controls', listId);

  button.addEventListener('click', () => {
    if (isDesktop.matches) return;
    toggleColumn(button, button.dataset.expanded !== 'true');
  });

  column.append(button, list);
  toggleColumn(button, false);
  return column;
}

/**
 * Builds one social icon link from an authored `footer-social-link` row.
 * Row fields (in model order): platform, link.
 * @param {Element} row The authored row
 * @returns {Element} The decorated `<a>`
 */
function buildSocialLink(row) {
  const [platformDiv, linkDiv] = row.children;
  const platform = platformDiv?.textContent.trim().toLowerCase();
  const href = linkDiv?.querySelector('a')?.href;
  if (!platform || !href) return null;

  const link = document.createElement('a');
  link.href = href;
  link.setAttribute('aria-label', platform);
  moveInstrumentation(row, link);

  const icon = document.createElement('span');
  icon.className = `icon icon-${platform}`;
  link.append(icon);

  return link;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load the authored footer block from the footer content page
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const authored = await loadFooterContent(footerPath);

  block.textContent = '';
  if (!authored) return;

  const rows = [...authored.children];
  // block-level fields come first, in model order: logo, logoAlt, logoLink, copyright
  const [logoDiv, logoAltDiv, logoLinkDiv, copyrightDiv] = rows;
  const itemRows = rows.slice(4);

  const footer = document.createElement('div');

  const logoImg = logoDiv?.querySelector('img');
  if (logoImg) {
    const picture = createOptimizedPicture(logoImg.src, logoAltDiv?.textContent.trim() || '', true);
    moveInstrumentation(logoImg, picture.querySelector('img'));
    const brand = document.createElement('p');
    brand.className = 'footer-brand';
    const href = logoLinkDiv?.querySelector('a')?.href;
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.append(picture);
      brand.append(link);
    } else {
      brand.append(picture);
    }
    footer.append(brand);
  }

  footer.append(document.createElement('hr'));

  const columns = document.createElement('div');
  columns.className = 'footer-columns';

  const socialLinks = document.createElement('p');
  socialLinks.className = 'footer-social-links';

  let columnIndex = 0;
  itemRows.forEach((row) => {
    const isColumn = row.children[1]?.querySelector('ul');
    if (isColumn) {
      columns.append(buildColumn(row, columnIndex));
      columnIndex += 1;
    } else {
      const link = buildSocialLink(row);
      if (link) socialLinks.append(link);
    }
  });
  if (socialLinks.children.length) columns.append(socialLinks);

  footer.append(columns);
  footer.append(document.createElement('hr'));

  if (copyrightDiv?.textContent.trim()) {
    const copyright = document.createElement('p');
    copyright.className = 'footer-copyright';
    moveInstrumentation(copyrightDiv, copyright);
    copyright.append(...copyrightDiv.childNodes);
    footer.append(copyright);
  }

  decorateIcons(footer);
  block.append(footer);
}
