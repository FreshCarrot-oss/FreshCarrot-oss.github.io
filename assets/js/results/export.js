/* Файл: assets/js/results/export.js */
/* PDF (jsPDF), share URL (Base64), copy text (Markdown) */

import { showToast }       from '../ui.js';
import { formatDate,
         formatDateFile }  from '../ui.js';
import { getResultDescription,
         MBTI_DESCRIPTIONS } from './descriptions.js';

// ── Получить название теста ───────────────────────────────────
function getTestName(testId) {
  const names = {
    pdo:'ПДО Личко', mbti:'MBTI', bigfive:'Big Five OCEAN',
    eysenck:'EPI Айзенка', leonhard:'Тест Леонгарда',
    cattell:'16PF Кеттела', iq:'IQ-тест',
  };
  return names[testId] || testId;
}

// ── Краткое описание результата для PDF / share ───────────────
function formatResultSummary(testId, result) {
  switch (testId) {
    case 'mbti':    return `${result.type} — «${result.typeName}»`;
    case 'bigfive': return `O:${result.percentages?.O}% C:${result.percentages?.C}% E:${result.percentages?.E}% A:${result.percentages?.A}% N:${result.percentages?.N}%`;
    case 'eysenck': return `${result.temperament} (E=${result.E}, N=${result.N})`;
    case 'pdo':     return `${result.leading}${result.secondary ? ' + ' + result.secondary : ''}`;
    case 'leonhard':{
      const top = Object.entries(result.scores||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k).join(', ');
      return top;
    }
    case 'cattell': return `Профиль 16PF (стены 1–10)`;
    case 'iq':      return `IQ ${result.iq} — ${result.category} (${result.percentile}й перцентиль)`;
    default:        return '';
  }
}

// ── Скачать PDF ───────────────────────────────────────────────
export async function downloadResultPDF(testId, result) {
  if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
    showToast('jsPDF не загружен. Попробуйте позже.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = margin;

  // ── Шапка ─────────────────────────────────────────────────
  doc.setFillColor(6, 6, 15);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(167, 139, 250);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PsychoTest', margin, 16);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('psychotest.github.io', margin, 23);

  y = 40;

  // ── Название теста ─────────────────────────────────────────
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(getTestName(testId), margin, y);
  y += 7;

  // ── Дата ───────────────────────────────────────────────────
  const user = window.__currentUser;
  const name = user?.displayName || 'Аноним';
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${name}  ·  ${formatDate(new Date())}`, margin, y);
  y += 10;

  // ── Разделитель ────────────────────────────────────────────
  doc.setDrawColor(50, 50, 80);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // ── Результат ──────────────────────────────────────────────
  doc.setTextColor(167, 139, 250);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const summary = formatResultSummary(testId, result);
  doc.text(summary, margin, y);
  y += 12;

  // ── График (canvas → base64 image) ────────────────────────
  const chartCanvas = document.querySelector('canvas[id$="Chart"], canvas[id="iqGauge"]');
  if (chartCanvas) {
    try {
      const imgData = chartCanvas.toDataURL('image/png');
      const imgW = 80, imgH = 60;
      doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
      y += imgH + 8;
    } catch {}
  }

  // ── Описание ──────────────────────────────────────────────
  const desc = getResultDescription(testId, result);
  if (desc?.summary) {
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Описание', margin, y);
    y += 6;

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(desc.summary, pageW - margin * 2);
    lines.forEach(line => {
      if (y > pageH - 30) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5;
    });
    y += 5;
  }

  // ── Сильные стороны ────────────────────────────────────────
  const strengths = desc?.strengths || desc?.traits;
  if (strengths?.length) {
    if (y > pageH - 60) { doc.addPage(); y = margin; }
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Сильные стороны', margin, y);
    y += 6;

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    strengths.slice(0, 7).forEach(s => {
      if (y > pageH - 20) { doc.addPage(); y = margin; }
      doc.text(`• ${s}`, margin + 3, y);
      y += 5.5;
    });
    y += 4;
  }

  // ── Зоны роста ─────────────────────────────────────────────
  const growth = desc?.growthAreas;
  if (growth?.length) {
    if (y > pageH - 50) { doc.addPage(); y = margin; }
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Зоны роста', margin, y);
    y += 6;

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    growth.slice(0, 5).forEach(g => {
      if (y > pageH - 20) { doc.addPage(); y = margin; }
      doc.text(`→ ${g}`, margin + 3, y);
      y += 5.5;
    });
  }

  // ── Футер на каждой странице ───────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(10, 10, 20);
    doc.rect(0, pageH - 14, pageW, 14, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Результат носит информационный характер · PsychoTest 2024',
      pageW / 2, pageH - 5, { align: 'center' }
    );
    doc.text(`${i} / ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }

  const filename = `psychotest_${testId}_${formatDateFile(new Date())}.pdf`;
  doc.save(filename);
  showToast('PDF сохранён! 📄', 'success');
}

// ── Генерировать Share URL ────────────────────────────────────
export function generateShareURL(testId, result) {
  const shareData = {
    t: testId,
    r: result,
    d: new Date().toISOString().slice(0, 10),
  };

  try {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
    const base = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
    return `${base}#/shared/${testId}?d=${encoded}`;
  } catch {
    return window.location.href;
  }
}

// ── Загрузить данные из shared-ссылки ─────────────────────────
export function loadSharedData() {
  try {
    const hash   = window.location.hash;
    const search = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(search);
    const encoded = params.get('d');
    if (!encoded) return null;
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── Поделиться (Web Share API / копировать) ───────────────────
export async function handleShareResult(testId, result) {
  const url = generateShareURL(testId, result);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Мои результаты теста ${getTestName(testId)} — PsychoTest`,
        text:  `Я прошёл тест ${getTestName(testId)}. Посмотри мои результаты!`,
        url,
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }

  await copyToClipboard(url);
  showToast('Ссылка скопирована в буфер обмена! ', 'success');
}

// ── Генерировать текст результата (Markdown) ──────────────────
export function generateResultText(testId, result) {
  const testName = getTestName(testId);
  const date     = formatDate(new Date());
  const desc     = getResultDescription(testId, result);
  const summary  = formatResultSummary(testId, result);
  const strengths = desc?.strengths || desc?.traits || [];
  const growth    = desc?.growthAreas || [];

  const lines = [
    `# ${testName} — Мои результаты`,
    `Дата: ${date} · PsychoTest`,
    ``,
    `## Результат`,
    summary,
    ``,
  ];

  if (desc?.summary) {
    lines.push('## Описание', desc.summary, '');
  }

  if (strengths.length) {
    lines.push('## Сильные стороны');
    strengths.forEach(s => lines.push(`• ${s}`));
    lines.push('');
  }

  if (growth.length) {
    lines.push('## Зоны роста');
    growth.forEach(g => lines.push(`→ ${g}`));
    lines.push('');
  }

  lines.push('---', 'Результат носит информационный характер.');
  return lines.join('\n');
}

// ── Скопировать результат в Markdown ─────────────────────────
export async function handleCopyResult(testId, result) {
  const text = generateResultText(testId, result);
  await copyToClipboard(text);
  showToast('Результат скопирован! ', 'success');

  const btn = document.getElementById('copyResultBtn');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = ' Скопировано';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 2500);
  }
}

// ── Универсальный copyToClipboard ─────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = Object.assign(document.createElement('textarea'), {
      value: text,
      style: 'position:fixed;top:-9999px;opacity:0',
    });
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}
