import Splide from 'https://cdn.jsdelivr.net/npm/@splidejs/splide/+esm';

function createOptimizedPicture(image, mobileImage) {
  const picture = document.createElement('picture');

  const source = document.createElement('source');
  source.media = '(max-width: 1199px)';
  source.srcset = mobileImage?.querySelector('img')?.src?.replace(/\?.*/,'');

  const img = document.createElement('img');
  img.src = image?.querySelector('img')?.src?.replace(/\?.*/,'');
  img.alt = image?.querySelector('img')?.alt || '';

  picture.append(source, img);
  image.className = 'cmp-teaser__image';
  image.replaceChildren(picture);
}

function isValidElement(ele) {
  if (ele) {
    return ele;
  }
  return "";
}

function decorateAndMountSplide(block) {
  const slideList = document.createElement('div');
  slideList.className = 'splide__list';
  slideList.append(...block.children);

  const slideTrack = document.createElement('div');
  slideTrack.className = 'splide__track';
  slideTrack.append(slideList);

  block.className = 'splide';
  block.replaceChildren(slideTrack);

  const splide = new Splide('.splide', {
    type: 'loop',
    arrows: false,
    padding: '6.52174%'
  });
  setTimeout(() => {

    splide.mount();
  }, 50);
}

export default function decorate(block) {
  [...block.children].forEach((div) => {
    let [image, mobileImage, preTitle, title, description, button, alignContent] = [...div.children];

    // Decorate Carousel Image for Desktop and Mobile View
    createOptimizedPicture(image, mobileImage);

    // Decorate PreTitle
    preTitle = preTitle.firstElementChild;
    if(preTitle) {
      preTitle.className = 'cmp-teaser__pretitle';
    }

    // Decorate Title
    title = title.firstElementChild;
    if(title) {
      title.className = 'cmp-teaser__title';
    }

    // Decorate Description
    description.className = 'cmp-teaser__description';

    // Decorate Button
    const buttonLink = button.querySelector('a');
    if (buttonLink) {
      button.className = 'cmp-teaser__action-container';
      buttonLink.className = 'cmp-teaser__action-link';
      button.replaceChildren(buttonLink);
    }

    // Decorate Teaser Content Block
    const teaserContentDiv = document.createElement('div');
    teaserContentDiv.className = 'cmp-teaser__content';
    teaserContentDiv.append(isValidElement(preTitle));
    teaserContentDiv.append(isValidElement(title));
    teaserContentDiv.append(description);
    teaserContentDiv.append(button);

    const teaserDiv = document.createElement('div');
    teaserDiv.className = 'teaser';
    teaserDiv.append(teaserContentDiv);
    teaserDiv.append(image);
    alignContent.textContent == 'left' ? teaserDiv.classList.add('content-on-bottom', 'content-on-left') :
      teaserDiv.classList.add('content-on-top', 'content-on-right');

    div.className = 'splide__slide';
    div.replaceChildren(teaserDiv);
  });
  decorateAndMountSplide(block);
}
