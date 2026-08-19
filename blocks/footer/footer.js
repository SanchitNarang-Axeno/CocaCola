import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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
 * Groups each heading + list pair into a `.footer-column`, turning the
 * heading into an accessible accordion trigger for mobile viewports.
 * @param {Element} content The default content wrapper holding the columns
 */
function decorateColumns(content) {
  const headings = content.querySelectorAll(':scope > h2, :scope > h3, :scope > h4');
  if (!headings.length) return null;

  const nav = document.createElement('div');
  nav.className = 'footer-columns';

  headings.forEach((heading, i) => {
    const list = heading.nextElementSibling;
    if (!list || list.tagName !== 'UL') return;

    const column = document.createElement('div');
    column.className = 'footer-column';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-column-toggle';
    button.innerHTML = heading.innerHTML;

    const listId = `footer-column-${i}`;
    list.id = listId;
    list.classList.add('footer-column-list');
    button.setAttribute('aria-controls', listId);

    button.addEventListener('click', () => {
      if (isDesktop.matches) return;
      toggleColumn(button, button.dataset.expanded !== 'true');
    });

    column.append(button, list);
    nav.append(column);
    heading.remove();

    toggleColumn(button, false);
  });

  isDesktop.addEventListener('change', () => {
    nav.querySelectorAll('.footer-column-toggle').forEach((button) => {
      toggleColumn(button, button.dataset.expanded === 'true');
    });
  });

  return nav;
}

/**
 * Finds the social icon links paragraph and marks it for styling.
 * @param {Element} content The default content wrapper
 * @returns {Element} The social links wrapper, if found
 */
function decorateSocialLinks(content) {
  const icons = content.querySelectorAll(':scope > p span.icon');
  if (!icons.length) return null;
  const wrapper = icons[0].closest('p');
  wrapper.classList.add('footer-social-links');
  return wrapper;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const content = footer.querySelector('.default-content-wrapper');
  if (content) {
    const socialLinks = decorateSocialLinks(content);
    const columns = decorateColumns(content);
    if (columns) {
      if (socialLinks) columns.append(socialLinks);
      const hr = content.querySelector('hr');
      if (hr) hr.after(columns);
      else content.append(columns);
    }
  }

  block.append(footer);
}
