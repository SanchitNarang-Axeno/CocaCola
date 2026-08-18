import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function updateActiveDot(dots, ul) {
  const { scrollLeft } = ul;
  const items = [...ul.children];
  let closest = 0;
  let closestDistance = Infinity;
  items.forEach((li, i) => {
    const distance = Math.abs(li.offsetLeft - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = i;
    }
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === closest));
}

function buildDots(ul, nav) {
  const items = [...ul.children];
  const dots = items.map((li, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'content-cards-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      li.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    nav.append(dot);
    return dot;
  });
  dots[0]?.classList.add('active');

  let ticking = false;
  ul.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveDot(dots, ul);
      ticking = false;
    });
  }, { passive: true });

  return dots;
}

export default function decorate(block) {
  const firstRow = block.children[0];
  const isHeadingRow = firstRow && !firstRow.querySelector('picture');
  const headingText = isHeadingRow ? firstRow.textContent.trim() : '';
  if (isHeadingRow) firstRow.remove();

  const rows = [...block.children];

  const ul = document.createElement('ul');
  ul.className = 'content-cards-list';
  rows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'content-cards-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'content-cards-card-image';
      } else {
        div.className = 'content-cards-card-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 600px)', width: '750' },
      { width: '500' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'content-cards-wrapper';

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.className = 'content-cards-heading';
    h2.textContent = headingText;
    wrapper.append(h2);
  }

  const track = document.createElement('div');
  track.className = 'content-cards-track';
  track.append(ul);
  wrapper.append(track);

  if (ul.children.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'content-cards-nav';
    wrapper.append(nav);
    // build dots after layout so offsetLeft is accurate
    requestAnimationFrame(() => buildDots(ul, nav));
  }

  block.replaceChildren(wrapper);
}
