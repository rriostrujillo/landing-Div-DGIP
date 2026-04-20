let currentEditorId = 'editor';

function setEditor(id) {
  currentEditorId = id;
}

// Rich text editor commands
function execCmd(cmd, value, targetId) {
  const id = targetId || currentEditorId;
  const editor = document.getElementById(id);
  if (editor) editor.focus();
  document.execCommand(cmd, false, value || null);
}

function insertLink(targetId) {
  const url = prompt('URL del enlace:');
  if (url) execCmd('createLink', url, targetId);
}

// HTML Modal Logic
function openHtmlModal(targetId) {
  const id = targetId || currentEditorId;
  const editor = document.getElementById(id);
  const modal = document.getElementById('htmlModal');
  const textarea = document.getElementById('htmlEditorTextarea');
  
  if (!modal || !textarea) return;
  
  textarea.value = editor.innerHTML;
  modal.dataset.target = id;
  modal.style.display = 'flex';
}

function closeHtmlModal() {
  const modal = document.getElementById('htmlModal');
  if (modal) modal.style.display = 'none';
}

function saveHtml() {
  const modal = document.getElementById('htmlModal');
  const id = modal.dataset.target;
  const textarea = document.getElementById('htmlEditorTextarea');
  const editor = document.getElementById(id);
  
  if (editor && textarea) {
    editor.innerHTML = textarea.value;
  }
  closeHtmlModal();
}

function previewPost() {
  const titleInput = document.querySelector('input[name="title"]');
  const title = titleInput ? titleInput.value : 'Vista Previa';
  const editor = document.getElementById('editor');
  const content = editor ? editor.innerHTML : '';
  const modal = document.getElementById('previewModal');
  const body = document.getElementById('previewModalBody');
  
  if (!modal || !body) return;
  
  body.innerHTML = `
    <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; min-height: 100%;">
      <h1 style="font-family: 'Outfit', sans-serif; color: #192D63; margin-bottom: 24px;">${title}</h1>
      <div class="article-content">${content}</div>
    </div>
  `;
  modal.style.display = 'flex';
}

function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  if (modal) modal.style.display = 'none';
}

function openMediaModal(targetId) {
  if (targetId) currentEditorId = targetId;
  const modal = document.getElementById('mediaModal');
  if (modal) {
    modal.style.display = 'flex';
    loadMediaLibrary();
  }
}

function closeMediaModal() {
  const modal = document.getElementById('mediaModal');
  if (modal) modal.style.display = 'none';
}

async function loadMediaLibrary() {
  try {
    const res = await fetch('/admin/media?json=1&type=image');
    const data = await res.json();
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    if (!data.media || !data.media.length) {
      grid.innerHTML = '<p style="color:#64748b;grid-column:1/-1;text-align:center;">No hay imágenes.</p>';
      return;
    }
    grid.innerHTML = data.media.map(m => `
      <div class="media-item" onclick="insertMediaImage('${m.path}','${m.alt_text||''}')">
        <img src="${m.thumbnail_path||m.path}" alt="${m.alt_text||m.original_name}" loading="lazy">
      </div>
    `).join('');
  } catch (e) { console.error('Error loading media:', e); }
}

function insertMediaImage(src, alt) {
  execCmd('insertHTML', `<img src="${src}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:12px 0;">`, currentEditorId);
  closeMediaModal();
}

function insertEmbed(targetId) {
  const code = prompt('Pega aquí el código embed (iframe, script, etc):');
  if (code) execCmd('insertHTML', code, targetId);
}

// Support for legacy post form
const postForm = document.getElementById('postForm');
if (postForm) {
  postForm.addEventListener('submit', function() {
    const editor = document.getElementById('editor');
    const input = document.getElementById('contentInput');
    if (editor && input) input.value = editor.innerHTML;
  });
}
