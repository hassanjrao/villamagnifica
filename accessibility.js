(() => {
  'use strict';
  const main = document.querySelector('main');
  const menu = document.querySelector('.navbar-collapse');
  const menuButton = document.querySelector('.navbar-toggler');
  const setMenu = open => { menu?.classList.toggle('show', open); menuButton?.setAttribute('aria-expanded', String(open)); };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  const dropdowns = [...document.querySelectorAll('button.dropdown-toggle')];
  document.querySelectorAll('[data-disclosure]').forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open)); document.getElementById(button.getAttribute('aria-controls'))?.classList.toggle('show', open);
  }));
  function closeDropdowns(except) {
    dropdowns.filter(button => button !== except).forEach(button => {
      button.setAttribute('aria-expanded', 'false'); document.getElementById(button.getAttribute('aria-controls'))?.classList.remove('show');
    });
  }
  dropdowns.forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true'; closeDropdowns(button);
    button.setAttribute('aria-expanded', String(open)); document.getElementById(button.getAttribute('aria-controls'))?.classList.toggle('show', open);
  }));
  document.addEventListener('click', event => { if (!event.target.closest('.dropdown')) closeDropdowns(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openDropdown = dropdowns.find(button => button.getAttribute('aria-expanded') === 'true');
    if (openDropdown) { closeDropdowns(); openDropdown.focus(); return; }
    if (menuButton?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]'); if (!anchor || anchor.hasAttribute('data-fancybox')) return;
    const target = anchor.hash === '#top' ? document.body : document.getElementById(anchor.hash.slice(1));
    if (!target) return;
    event.preventDefault(); target.setAttribute('tabindex', '-1'); target.focus(); target.scrollIntoView();
    setMenu(false); closeDropdowns();
    if (anchor.hash !== '#top') history.replaceState(null, '', anchor.hash);
  });
  document.querySelectorAll('[data-carousel]').forEach(button => button.addEventListener('click', () => {
    const carousel = document.getElementById(button.dataset.carousel); if (!carousel) return;
    const slides = [...carousel.querySelectorAll('.carousel-item')];
    let index = slides.findIndex(slide => slide.classList.contains('active'));
    index = (index + (button.dataset.direction === 'next' ? 1 : -1) + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.classList.toggle('active', i === index); slide.inert = i !== index; slide.setAttribute('aria-hidden', String(i !== index)); });
    const status = carousel.querySelector('.carousel-status'); if (status) status.textContent = `Photo ${index + 1} of ${slides.length}: ${slides[index].getAttribute('aria-label') || ''}`;
  }));
  // Native dialogs handle focus containment, Escape and background isolation.
  const viewerLinks = [...document.querySelectorAll('a[data-fancybox]')].filter(a => /\.(?:jpe?g|png|gif|webp|mp4)(?:[?#]|$)/i.test(a.href));
  if (viewerLinks.length) {
    const dialog = document.createElement('dialog'); dialog.className = 'photo-viewer'; dialog.setAttribute('aria-labelledby', 'viewer-title');
    dialog.innerHTML = '<div class="viewer-controls"><button type="button" data-action="previous">Previous photo</button><button type="button" data-action="next">Next photo</button><button type="button" data-action="close">Close viewer</button></div><h2 id="viewer-title">Villa Magnifica</h2><div class="viewer-media"></div><p class="viewer-caption" role="status" aria-live="polite"></p>';
    document.body.append(dialog); let opener, group = [], index = 0;
    const startGuard = document.createElement('button'), endGuard = document.createElement('button');
    startGuard.type = endGuard.type = 'button'; startGuard.className = endGuard.className = 'sr-only';
    startGuard.textContent = 'Return to the last viewer control'; endGuard.textContent = 'Return to the first viewer control';
    dialog.prepend(startGuard); dialog.append(endGuard);
    const returnFirst = () => dialog.querySelector('[data-action="close"]').focus();
    const returnLast = () => (dialog.querySelector('video') || dialog.querySelector('[data-action="close"]')).focus();
    startGuard.addEventListener('focus', returnLast); endGuard.addEventListener('focus', returnFirst);
    startGuard.addEventListener('click', returnLast); endGuard.addEventListener('click', returnFirst);
    const previous = dialog.querySelector('[data-action="previous"]'), next = dialog.querySelector('[data-action="next"]');
    function render() {
      const link = group[index], video = /\.mp4(?:[?#]|$)/i.test(link.href), media = document.createElement(video ? 'video' : 'img');
      const description = link.querySelector('img')?.alt || link.getAttribute('aria-label') || link.textContent.trim() || document.title;
      media.src = link.href;
      if (video) { media.controls = true; media.preload = 'none'; media.tabIndex = 0; media.setAttribute('aria-label', description); }
      else media.alt = description;
      dialog.querySelector('.viewer-media').replaceChildren(media);
      dialog.querySelector('.viewer-caption').textContent = description + (group.length > 1 ? ` — ${index + 1} of ${group.length}` : '');
      previous.hidden = next.hidden = video || group.length < 2;
    }
    function advance(amount) { index = (index + amount + group.length) % group.length; render(); }
    viewerLinks.forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); opener = link;
      group = /\.mp4(?:[?#]|$)/i.test(link.href) ? [link] : viewerLinks.filter(a => !/\.mp4(?:[?#]|$)/i.test(a.href) && a.dataset.fancybox === link.dataset.fancybox);
      index = group.indexOf(link); render(); dialog.showModal(); dialog.querySelector('[data-action="close"]').focus();
    }));
    previous.addEventListener('click', () => advance(-1)); next.addEventListener('click', () => advance(1));
    dialog.querySelector('[data-action="close"]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { dialog.querySelector('video')?.pause(); dialog.querySelector('.viewer-media').replaceChildren(); opener?.focus(); });
    dialog.addEventListener('keydown', event => {
      if (!previous.hidden && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); advance(event.key === 'ArrowLeft' ? -1 : 1); }
    });
  }
  document.querySelectorAll('form').forEach(form => {
    const fields = [...form.querySelectorAll('input:not([type="hidden"]), textarea, select')];
    const status = form.querySelector('.form-status'), button = form.querySelector('[type="submit"]');
    function clearErrors() {
      fields.forEach(field => { field.removeAttribute('aria-invalid'); const error = document.getElementById(field.id + '-error'); if (error) { error.hidden = true; error.textContent = ''; } });
      status.replaceChildren();
    }
    function showErrors(errors) {
      status.setAttribute('role', 'alert'); const title = document.createElement('p'); title.textContent = 'Please correct the following fields:'; status.append(title);
      const list = document.createElement('ul');
      Object.entries(errors).forEach(([name, message]) => {
        const field = fields.find(f => f.name === name); if (!field) return;
        field.setAttribute('aria-invalid', 'true'); const error = document.getElementById(field.id + '-error'); error.textContent = message; error.hidden = false;
        const li = document.createElement('li'), link = document.createElement('a'); link.href = '#' + field.id; link.textContent = message; link.addEventListener('click', event => { event.preventDefault(); field.focus(); }); li.append(link); list.append(li);
      });
      status.append(list); status.focus();
    }
    fields.forEach(field => field.addEventListener('input', () => { field.removeAttribute('aria-invalid'); const error = document.getElementById(field.id + '-error'); if (error) error.hidden = true; }));
    form.addEventListener('submit', async event => {
      event.preventDefault(); clearErrors(); const errors = {};
      fields.forEach(field => {
        const label = document.querySelector(`label[for="${field.id}"]`)?.textContent.replace(/\s*\((?:required|optional)\)$/, '') || field.name;
        if (field.required && !field.value.trim()) errors[field.name] = label + ' is required.';
        else if (!field.validity.valid) errors[field.name] = field.type === 'email' ? 'Enter a valid email address.' : field.type === 'number' ? 'Enter a number of guests between 1 and 24.' : 'Enter a valid ' + label.toLowerCase() + '.';
      });
      const arrival = form.querySelector('#fdate'), departure = form.querySelector('#ldate');
      if (arrival?.value && departure?.value && departure.value < arrival.value) errors.ldate = 'Departure date must be on or after the arrival date.';
      if (Object.keys(errors).length) { showErrors(errors); return; }
      button.disabled = true; form.setAttribute('aria-busy', 'true'); status.setAttribute('role', 'status'); status.textContent = 'Sending your message…';
      try {
        const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)), headers: {Accept: 'application/json'} });
        const result = await response.json(); status.replaceChildren();
        if (result.errors) showErrors(result.errors);
        else { status.setAttribute('role', response.ok ? 'status' : 'alert'); status.textContent = result.message || 'Your message could not be sent. Please try again.'; if (response.ok) form.reset(); status.focus(); }
      } catch { status.setAttribute('role', 'alert'); status.textContent = 'Your message could not be sent. Check your connection and try again. Your entries have been kept.'; status.focus(); }
      finally { button.disabled = false; form.removeAttribute('aria-busy'); }
    });
  });
})();
