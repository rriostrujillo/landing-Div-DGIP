// Rich text editor commands
function execCmd(cmd, value) {
  document.execCommand(cmd, false, value || null);
  document.getElementById('editor').focus();
}

function insertLink() {
  const url = prompt('URL del enlace:');
  if (url) execCmd('createLink', url);
}

function insertEmbed() {
  const url = prompt('URL del video (YouTube, Vimeo):');
  if (!url) return;
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  const iframe = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:16px 0;"><iframe src="${embedUrl}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;"></iframe></div>`;
  execCmd('insertHTML', iframe);
}

function openMediaModal() {
  document.getElementById('mediaModal').classList.add('active');
  loadMediaLibrary();
}

function closeMediaModal() {
  document.getElementById('mediaModal').classList.remove('active');
}

async function loadMediaLibrary() {
  try {
    const res = await fetch('/admin/media?json=1&type=image');
    const data = await res.json();
    const grid = document.getElementById('mediaGrid');
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
  execCmd('insertHTML', `<img src="${src}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:12px 0;">`);
  closeMediaModal();
}

// Save content to hidden input on submit
document.getElementById('postForm').addEventListener('submit', function() {
  document.getElementById('contentInput').value = document.getElementById('editor').innerHTML;
});
