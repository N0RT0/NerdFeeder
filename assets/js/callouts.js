/* Obsidian-style Callouts for Jekyll/GitHub Pages */
(function () {
  'use strict';

  const TYPE_ALIASES = {
    note: 'Note', info: 'Info', tip: 'Tip', success: 'Success',
    warning: 'Warning', caution: 'Warning', danger: 'Danger', bug: 'Bug',
    example: 'Example', quote: 'Quote', question: 'Question', todo: 'Todo',
    abstract: 'Abstract', summary: 'Summary'
  };

  // Match only the start of the header line: [!TYPE] optional(+|-) optional(title)
  const HEADER_RE = /^\s*\[\!([A-Za-z][\w-]*)\]\s*([+-])?\s*(.*)/;

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function parseHeaderFromParagraph(p) {
    if (!p || p.tagName !== 'P') return null;
    const raw = (p.textContent || '').replace(/\r\n?/g, '\n');
    const firstLine = raw.split('\n', 1)[0].trim();
    const m = firstLine.match(HEADER_RE);
    if (!m) return null;

    const rawType = (m[1] || '').toLowerCase();
    const fold = m[2] || null; // null => not collapsible, '+' => open, '-' => closed
    const titleText = (m[3] || '').trim() || TYPE_ALIASES[rawType] || rawType;

    const firstNewlineIdx = raw.indexOf('\n');
    const remainder = firstNewlineIdx >= 0 ? raw.slice(firstNewlineIdx + 1).trimStart() : '';

    return { rawType, fold, titleText, remainder };
  }

  function transformBlockquote(bq) {
    const firstP = bq.firstElementChild?.tagName === 'P' ? bq.firstElementChild : null;
    const header = parseHeaderFromParagraph(firstP);
    if (!header) return false;

    const { rawType, fold, titleText, remainder } = header;

    // Build container
    const wrapper = makeEl('div', `callout callout-${rawType}`);
    wrapper.setAttribute('data-callout', rawType);
    wrapper.setAttribute('role', 'note');

    // Title row
    const titleRow = makeEl('div', 'callout-title');
    titleRow.appendChild(makeEl('span', 'callout-title-text', titleText));

    // Body
    const body = makeEl('div', 'callout-body');
    const frag = document.createDocumentFragment();

    // Remainder of first paragraph after header line
    if (remainder.length) frag.appendChild(makeEl('p', null, remainder));

    // Move all siblings after the first paragraph into the body
    let el = firstP.nextSibling;
    while (el) {
      const next = el.nextSibling;
      frag.appendChild(el);
      el = next;
    }

    const hasBody = frag.childNodes.length > 0;
    if (hasBody) body.appendChild(frag);

    // Collapsing rules: only if there is a body AND a +/- sign was provided
    if (hasBody && (fold === '+' || fold === '-')) {
      const btn = makeEl('button', 'callout-toggle', '▾');
      const bodyId = `callout-body-${Math.random().toString(36).slice(2)}`;
      body.id = bodyId;

      btn.type = 'button';
      btn.setAttribute('aria-label', 'Toggle callout');
      btn.setAttribute('aria-controls', bodyId);

      const collapsed = fold === '-';
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      if (collapsed) wrapper.classList.add('is-collapsed');

      btn.addEventListener('click', () => {
        const isCollapsed = wrapper.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      });

      titleRow.appendChild(btn);
    }

    wrapper.appendChild(titleRow);
    if (hasBody) wrapper.appendChild(body);

    bq.replaceWith(wrapper);
    return true;
  }

  function run() {
    const bqs = document.querySelectorAll('blockquote');
    for (const bq of bqs) {
      const p = bq.firstElementChild;
      if (!p || p.tagName !== 'P') continue;
      const firstLine = ((p.textContent || '').replace(/\r\n?/g, '\n').split('\n', 1)[0] || '').trim();
      if (!HEADER_RE.test(firstLine)) continue;
      transformBlockquote(bq);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
