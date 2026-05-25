// State Management
let notes = JSON.parse(localStorage.getItem('afzal_notes')) || [];
let currentTab = 'notes'; // Can be 'notes', 'important', 'deleted'

// DOM Elements
const notesGrid = document.getElementById('notes');
const emptyState = document.getElementById('emptyState');
const noteInput = document.getElementById('noteInput');
const searchInput = document.getElementById('searchInput');
const noteCount = document.getElementById('noteCount');
const themeBtn = document.getElementById('themeBtn');
const sidebarButtons = document.querySelectorAll('.menu button');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderNotes();
  setupTheme();
  
  // Tab Switching Listener
  sidebarButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      sidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (index === 0) currentTab = 'notes';
      if (index === 1) currentTab = 'important';
      if (index === 2) currentTab = 'deleted';
      
      renderNotes();
    });
  });

  // Search Event Listener
  searchInput.addEventListener('input', renderNotes);
});

// Render System
function renderNotes() {
  const searchQuery = searchInput.value.toLowerCase();
  notesGrid.innerHTML = '';

  // Filter notes based on current view/tab and search query
  let filteredNotes = notes.filter(note => {
    const matchesSearch = note.text.toLowerCase().includes(searchQuery);
    
    if (currentTab === 'notes') return !note.deleted && matchesSearch;
    if (currentTab === 'important') return note.important && !note.deleted && matchesSearch;
    if (currentTab === 'deleted') return note.deleted && matchesSearch;
    
    return false;
  });

  // Update counts
  const totalActiveNotes = notes.filter(n => !n.deleted).length;
  noteCount.textContent = `${totalActiveNotes} Note${totalActiveNotes !== 1 ? 's' : ''}`;

  if (filteredNotes.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    
    filteredNotes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <p>${escapeHTML(note.text)}</p>
        <div class="note-footer">
          <span>${note.date}</span>
          <div class="note-actions">
            ${!note.deleted ? `
              <i class="fa-${note.important ? 'solid' : 'regular'} fa-star ${note.important ? 'active' : ''}" onclick="toggleImportant(${note.id})"></i>
              <i class="fa-solid fa-trash" onclick="moveToTrash(${note.id})"></i>
            ` : `
              <i class="fa-solid fa-trash-arrow-up" title="Restore" onclick="restoreNote(${note.id})"></i>
              <i class="fa-solid fa-circle-xmark" title="Delete Permanently" onclick="permanentlyDelete(${note.id})" style="color: #ef4444;"></i>
            `}
          </div>
        </div>
      `;
      notesGrid.appendChild(card);
    });
  }
}

// Actions
function addNote() {
  const text = noteInput.value.trim();
  if (!text) return;

  const newNote = {
    id: Date.now(),
    text: text,
    important: false,
    deleted: false,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };

  notes.unshift(newNote);
  saveToStorage();
  noteInput.value = '';
  renderNotes();
  showToast('Note Added Successfully ✅');
}

function toggleImportant(id) {
  notes = notes.map(note => note.id === id ? { ...note, important: !note.important } : note);
  saveToStorage();
  renderNotes();
}

function moveToTrash(id) {
  notes = notes.map(note => note.id === id ? { ...note, deleted: true } : note);
  saveToStorage();
  renderNotes();
  showToast('Moved to Trash 🗑️');
}

function restoreNote(id) {
  notes = notes.map(note => note.id === id ? { ...note, deleted: false } : note);
  saveToStorage();
  renderNotes();
  showToast('Note Restored ↩️');
}

function permanentlyDelete(id) {
  notes = notes.filter(note => note.id !== id);
  saveToStorage();
  renderNotes();
  showToast('Note Deleted Permanently ❌');
}

// Theme Config
function setupTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const icon = themeBtn.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}

// Helpers
function saveToStorage() {
  localStorage.setItem('afzal_notes', JSON.stringify(notes));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}