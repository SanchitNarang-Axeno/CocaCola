/**
 * Get the text content of a row safely.
 */
function getText(row) {
  return row?.textContent?.trim() || '';
}

/**
 * Get the first link from a row.
 * Falls back to the text value if no <a> exists.
 */
function getLink(row) {
  const link = row?.querySelector('a');

  if (link?.href) {
    return link.href;
  }

  const text = getText(row);

  if (!text) {
    return '';
  }

  if (/^(https?:\/\/|\/|#)/i.test(text)) {
    return text;
  }

  return `https://${text}`;
}

/**
 * Create CTA button.
 */
function createCta(label, href, className = 'promo-card-cta') {
  if (!label || !href) {
    return null;
  }

  const cta = document.createElement('a');
  cta.className = className;
  cta.href = href;

  cta.innerHTML = `
    <span>${label}</span>
  `;

  return cta;
}

/**
 * Get image from the image row.
 */
function getImage(row) {
  return row?.querySelector('picture, img') || null;
}

export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  /*
   * Expected Universal Editor model order:
   *
   * 0 - Image
   * 1 - Title
   * 2 - Subtitle
   * 3 - Description
   * 4 - Variant
   * 5 - CTA Label
   * 6 - CTA Link
   * 7 - Main CTA Label
   * 8 - Main CTA Link
   */

  const [
    imageRow,
    titleRow,
    subtitleRow,
    descriptionRow,
    variantRow,
    ctaLabelRow,
    ctaLinkRow,
    mainCtaLabelRow,
    mainCtaLinkRow,
  ] = rows;

  /* -------------------------------------------------------------
     Get authored values safely
     ------------------------------------------------------------- */

  const image = getImage(imageRow);

  const title = getText(titleRow);
  const subtitle = getText(subtitleRow);

  const descriptionHtml =
    descriptionRow?.innerHTML?.trim() || '';

  /* -------------------------------------------------------------
     Get variant
     ------------------------------------------------------------- */

  const variantValue = getText(variantRow)
    .toLowerCase()
    .trim();

  /*
   * Variant meaning:
   *
   * left-img  = Image LEFT + Content RIGHT
   * right-img = Content LEFT + Image RIGHT
   */

  const variant = variantValue.includes('right')
    ? 'right-img'
    : 'left-img';

  console.log('Authored variant:', variantValue);
  console.log('Final variant:', variant);

  const ctaLabel = getText(ctaLabelRow);
  const ctaLink = getLink(ctaLinkRow);

  const mainCtaLabel = getText(mainCtaLabelRow);
  const mainCtaLink = getLink(mainCtaLinkRow);

  /* -------------------------------------------------------------
     Add variant class to block
     ------------------------------------------------------------- */

  block.classList.remove('left-img', 'right-img');
  block.classList.add(variant);

  /* -------------------------------------------------------------
     Create main card
     ------------------------------------------------------------- */

  const card = document.createElement('div');
  card.className = 'promo-card-inner';

  /* -------------------------------------------------------------
     Image
     ------------------------------------------------------------- */

  let imageContainer = null;

  if (image) {
    imageContainer = document.createElement('div');
    imageContainer.className = 'promo-card-image';

    /*
     * Move the complete picture or img into the image container.
     */
    imageContainer.append(image);
  }

  /* -------------------------------------------------------------
     Content
     ------------------------------------------------------------- */

  const content = document.createElement('div');
  content.className = 'promo-card-content';

  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'promo-card-title';
    titleElement.textContent = title;
    content.append(titleElement);
  }

  if (subtitle) {
    const subtitleElement = document.createElement('div');
    subtitleElement.className = 'promo-card-subtitle';
    subtitleElement.textContent = subtitle;
    content.append(subtitleElement);
  }

  if (descriptionHtml) {
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'promo-card-description';
    descriptionElement.innerHTML = descriptionHtml;
    content.append(descriptionElement);
  }

  /* -------------------------------------------------------------
     Card CTA
     ------------------------------------------------------------- */

  const cardCta = createCta(ctaLabel, ctaLink);

  if (cardCta) {
    content.append(cardCta);
  }

  /* -------------------------------------------------------------
     Arrange image/content according to variant
     ------------------------------------------------------------- */

  if (variant === 'left-img') {
    /*
     * LEFT IMAGE
     *
     * Image | Content
     */
    if (imageContainer) {
      card.append(imageContainer);
    }

    card.append(content);
  } else {
    /*
     * RIGHT IMAGE
     *
     * Content | Image
     */
    card.append(content);

    if (imageContainer) {
      card.append(imageContainer);
    }
  }

  /* -------------------------------------------------------------
     Main CTA
     ------------------------------------------------------------- */

  const mainCta = createCta(
    mainCtaLabel,
    mainCtaLink,
    'promo-main-cta',
  );

  /* -------------------------------------------------------------
     Replace original authored markup
     ------------------------------------------------------------- */

  block.replaceChildren(card);

  /*
   * Main CTA is optional.
   */
  if (mainCta) {
    const mainCtaWrapper = document.createElement('div');
    mainCtaWrapper.className = 'promo-main-cta-wrapper';

    mainCtaWrapper.append(mainCta);

    block.append(mainCtaWrapper);
  }
}