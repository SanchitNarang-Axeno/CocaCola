import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Sustainability Feature block
 * Authored fields (in order, one row per field via Universal Editor model):
 * 1. image        - reference (picture)
 * 2. eyebrow       - text
 * 3. heading       - text
 * 4. description   - richtext
 * 5. buttonText    - text
 * 5. buttonLink    - aem-content (link/href)
 *
 * Desktop: text left / image right
 * Mobile:  image top / text below
 */
export default function decorate(block) {
  const rows = [...block.children];

  const [imageRow, headingRow, descriptionRow, buttonTextRow, buttonLinkRow] = rows;

  // ---- Image ----
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'sustainability-image';

  const img = imageRow?.querySelector('img');
  if (img) {
    const picture = createOptimizedPicture(img.src, img.alt || '', false, [
      { width: '750' },
    ]);
    imageWrapper.append(picture);
  }

  // ---- Text content ----
  const content = document.createElement('div');
  content.className = 'sustainability-content';



  if (headingRow?.textContent.trim()) {
    const heading = document.createElement('h2');
    heading.className = 'sustainability-heading';
    heading.textContent = headingRow.textContent.trim();
    content.append(heading);
  }

  if (descriptionRow?.textContent.trim()) {
    const description = document.createElement('div');
    description.className = 'sustainability-description';
    description.innerHTML = descriptionRow.innerHTML;
    content.append(description);
  }

  const buttonText = buttonTextRow?.textContent.trim();
  const buttonLink = buttonLinkRow?.querySelector('a')?.href || buttonLinkRow?.textContent.trim();

  if (buttonText) {
    const cta = document.createElement('p');
    cta.className = 'sustainability-cta';

    const link = document.createElement('a');
    link.className = 'button sustainability-button';
    link.textContent = buttonText;
    link.href = buttonLink || '#';

    cta.append(link);
    content.append(cta);
  }

  // ---- Assemble ----
  block.textContent = '';
  block.append(content, imageWrapper);
}
