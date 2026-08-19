export default function decorate(block) {
  const rows = [...block.children];

  const headingText = rows[0]?.textContent.trim() || '';

  const headingTypeValue = rows[1]?.textContent.trim().toLowerCase();

  const headingType = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
    headingTypeValue,
  )
    ? headingTypeValue
    : 'h2';

  const alignmentValue = rows[2]?.textContent.trim().toLowerCase();

  const alignment = ['left', 'center'].includes(alignmentValue)
    ? alignmentValue
    : 'center';

  block.innerHTML = '';

  const heading = document.createElement(headingType);
  heading.textContent = headingText;
  heading.classList.add(`heading-${alignment}`);

  block.append(heading);
}