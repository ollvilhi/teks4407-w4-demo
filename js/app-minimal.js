/**
 * InfoAHKY - Minimal News Application
 * Clean, news-focused JavaScript
 */

// Application state
const App = {
    messages: [],
    editingId: null,
    currentFilter: 'aloitus',
    infoBoxText: 'Tervetuloa organisaation tiedotuskanavalle. Tältä sivulta löydät ajankohtaiset uutiset ja tärkeimmät tiedotteet eri kategorioista. Pysy ajan tasalla!'
};

const Theme = {
    STORAGE_KEY: 'infoahky_theme',
    LIGHT: 'light',
    TELETEXT: 'teletext',
    YOUTH: 'youth'
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadMessages();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    setupEventListeners();
    renderNewsList();
});

function initTheme() {
    const saved = localStorage.getItem(Theme.STORAGE_KEY);
    let theme = Theme.LIGHT;
    if (saved === Theme.TELETEXT) {
        theme = Theme.TELETEXT;
    } else if (saved === Theme.YOUTH) {
        theme = Theme.YOUTH;
    }
    applyTheme(theme);
}

function applyTheme(theme) {
    const lightLink = document.getElementById('theme-light');
    const teletextLink = document.getElementById('theme-teletext');
    const youthLink = document.getElementById('theme-youth');

    if (lightLink && teletextLink && youthLink) {
        lightLink.disabled = theme !== Theme.LIGHT;
        teletextLink.disabled = theme !== Theme.TELETEXT;
        youthLink.disabled = theme !== Theme.YOUTH;
    }

    document.body.dataset.theme = theme;
    localStorage.setItem(Theme.STORAGE_KEY, theme);
    updateThemeToggleButton(theme);
}

function toggleTheme() {
    const current = document.body.dataset.theme || Theme.LIGHT;
    let next;
    
    if (current === Theme.LIGHT) {
        next = Theme.TELETEXT;
    } else if (current === Theme.TELETEXT) {
        next = Theme.YOUTH;
    } else {
        next = Theme.LIGHT;
    }
    
    applyTheme(next);
}

function updateThemeToggleButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    // Button shows what you will switch to
    if (theme === Theme.LIGHT) {
        btn.textContent = 'Teksti-TV';
    } else if (theme === Theme.TELETEXT) {
        btn.textContent = 'Nuorisoversio';
    } else {
        btn.textContent = 'Vaalea';
    }
}

// Load messages from localStorage
function loadMessages() {
    const stored = localStorage.getItem('infoahky_messages');
    if (stored) {
        App.messages = JSON.parse(stored);
    } else {
        // Add sample messages for first visit
        App.messages = [
            {
                id: generateId(),
                title: 'Tervetuloa InfoAHKY:yn',
                content: 'Tämä on organisaatiosi tiedotuskanava. Napauta viestiä lukeaksesi sen. Lisää uusi viesti + -painikkeella.',
                category: 'tuotekehitys',
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            },
            {
                id: generateId(),
                title: 'Järjestelmä käytössä',
                content: 'InfoAHKY on nyt aktiivisessa käytössä. Viestit tallentuvat selaimen muistiin.',
                category: 'johto',
                created: new Date(Date.now() - 3600000).toISOString(),
                updated: new Date(Date.now() - 3600000).toISOString()
            }
        ];
        saveMessages();
    }
    
    // Load info box text from localStorage
    const storedInfoBoxText = localStorage.getItem('infoahky_infobox_text');
    if (storedInfoBoxText) {
        App.infoBoxText = storedInfoBoxText;
    }
}

// Save messages to localStorage
function saveMessages() {
    localStorage.setItem('infoahky_messages', JSON.stringify(App.messages));
}

// Save info box text to localStorage
function saveInfoBoxText() {
    localStorage.setItem('infoahky_infobox_text', App.infoBoxText);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('fi-FI', { weekday: 'short', day: 'numeric', month: 'numeric' });
    
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
}

// Setup event listeners
function setupEventListeners() {
    // FAB button
    document.getElementById('fab-add').addEventListener('click', () => openModal());

    // Fullscreen button
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // Form submission
    document.getElementById('message-form').addEventListener('submit', handleFormSubmit);
    
    // Cancel and close buttons
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);

    // Close modal on backdrop click
    document.getElementById('message-modal').addEventListener('click', (e) => {
        if (e.target.id === 'message-modal') {
            closeModal();
        }
    });

    // Info box modal event listeners
    const infoboxForm = document.getElementById('infobox-form');
    if (infoboxForm) {
        infoboxForm.addEventListener('submit', handleInfoBoxSubmit);
    }
    const infoboxCancelBtn = document.getElementById('infobox-cancel-btn');
    if (infoboxCancelBtn) {
        infoboxCancelBtn.addEventListener('click', closeInfoBoxModal);
    }
    const infoboxCloseBtn = document.getElementById('infobox-close-btn');
    if (infoboxCloseBtn) {
        infoboxCloseBtn.addEventListener('click', closeInfoBoxModal);
    }
    const infoboxModal = document.getElementById('infobox-modal');
    if (infoboxModal) {
        infoboxModal.addEventListener('click', (e) => {
            if (e.target.id === 'infobox-modal') {
                closeInfoBoxModal();
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Handle keyboard
function handleKeyboard(e) {
    const modal = document.getElementById('message-modal');
    const infoboxModal = document.getElementById('infobox-modal');
    if (modal.style.display !== 'none') {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
    if (infoboxModal && infoboxModal.style.display !== 'none') {
        if (e.key === 'Escape') {
            closeInfoBoxModal();
        }
    }
}

// Render news list - the main view
function renderNewsList() {
    const container = document.getElementById('main-content');
    
    // Filter messages
    let filtered = [...App.messages];
    if (App.currentFilter !== 'all' && App.currentFilter !== 'aloitus') {
        filtered = filtered.filter(m => m.category === App.currentFilter);
    }
    
    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Build HTML
    let html = `
        <div class="filter-tabs">
            <button class="filter-tab ${App.currentFilter === 'aloitus' ? 'active' : ''}" data-filter="aloitus">Aloitus</button>
            <button class="filter-tab ${App.currentFilter === 'all' ? 'active' : ''}" data-filter="all">Kaikki</button>
            <button class="filter-tab ${App.currentFilter === 'johto' ? 'active' : ''}" data-filter="johto">Johto</button>
            <button class="filter-tab ${App.currentFilter === 'tuotekehitys' ? 'active' : ''}" data-filter="tuotekehitys">Tuotekehitys</button>
            <button class="filter-tab ${App.currentFilter === 'it-tuki' ? 'active' : ''}" data-filter="it-tuki">IT-tuki</button>
            <button class="filter-tab ${App.currentFilter === 'turvallisuus' ? 'active' : ''}" data-filter="turvallisuus">Turvallisuus</button>
            <button class="filter-tab ${App.currentFilter === 'hr' ? 'active' : ''}" data-filter="hr">HR</button>
        </div>
    `;

    // Handle start view (aloitusnäkymä) - show one main topic per category, then info box below
    if (App.currentFilter === 'aloitus') {
        // Get main topics from each category (one per category)
        const categories = ['johto', 'tuotekehitys', 'it-tuki', 'turvallisuus', 'hr'];
        const mainTopics = [];
        
        categories.forEach(cat => {
            // First try to find a message marked as main topic
            let mainMsg = App.messages.find(m => m.category === cat && m.isMainTopic);
            // If none marked, get the newest message from that category
            if (!mainMsg) {
                const catMessages = App.messages.filter(m => m.category === cat);
                if (catMessages.length > 0) {
                    catMessages.sort((a, b) => new Date(b.created) - new Date(a.created));
                    mainMsg = catMessages[0];
                }
            }
            if (mainMsg) {
                mainTopics.push(mainMsg);
            }
        });
        
        if (mainTopics.length > 0) {
            html += '<h3 class="main-topics-title">Pääaiheet</h3>';
            html += '<ul class="news-list main-topics-list">';
            mainTopics.forEach(msg => {
                const categoryLabel = getCategoryLabel(msg.category);
                html += `
                    <li class="news-item main-topic-item" data-id="${msg.id}">
                        <div class="news-header">
                            <div class="news-title">${getMainTopicBadge(msg.isMainTopic)}${escapeHtml(msg.title)}</div>
                            <div class="news-right">
                                <span class="news-category ${msg.category}">${categoryLabel}</span>
                                <div class="news-meta">${formatDate(msg.created)}</div>
                            </div>
                        </div>
                        <div class="news-content">${escapeHtml(msg.content)}</div>
                    </li>
                `;
            });
            html += '</ul>';
        } else {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">Ei pääaiheita</div>
                </div>
            `;
        }
        
        // Info box with edit button - now placed after news items
        html += `
            <div class="info-box">
                <div class="info-box-icon">ℹ️</div>
                <div class="info-box-text">${escapeHtml(App.infoBoxText)}</div>
                <button class="info-box-edit-btn" id="edit-info-box-btn" aria-label="Muokkaa tiivistelmää">✏️</button>
            </div>
        `;
    } else if (filtered.length > 0) {
        html += '<ul class="news-list">';
        filtered.forEach(msg => {
            const categoryLabel = getCategoryLabel(msg.category);
            html += `
                <li class="news-item ${msg.isMainTopic ? 'is-main-topic' : ''}" data-id="${msg.id}">
                    <div class="news-header">
                        <div class="news-title">${getMainTopicBadge(msg.isMainTopic)}${escapeHtml(msg.title)}</div>
                        <div class="news-right">
                            <span class="news-category ${msg.category}">${categoryLabel}</span>
                            <div class="news-meta">${formatDate(msg.created)}</div>
                        </div>
                    </div>
                    <div class="news-content">${escapeHtml(msg.content)}</div>
                    <div class="news-actions">
                        <button class="btn-action btn-main-topic" data-action="toggle-main">${msg.isMainTopic ? 'Poista pääaihe' : 'Aseta pääaiheeksi'}</button>
                        <button class="btn-action btn-edit" data-action="edit">Muokkaa</button>
                        <button class="btn-action btn-delete" data-action="delete">Poista</button>
                    </div>
                </li>
            `;
        });
        html += '</ul>';
    } else {
        html += `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">Ei viestejä</div>
            </div>
        `;
    }

    // Add stats at bottom for all categories (single pass through messages)
    const categoryCounts = App.messages.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
    }, {});
    
    html += `
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-value">${categoryCounts['johto'] || 0}</div>
                <div class="stat-label">Johto</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${categoryCounts['tuotekehitys'] || 0}</div>
                <div class="stat-label">Tuotekehitys</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${categoryCounts['it-tuki'] || 0}</div>
                <div class="stat-label">IT-tuki</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${categoryCounts['turvallisuus'] || 0}</div>
                <div class="stat-label">Turvallisuus</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${categoryCounts['hr'] || 0}</div>
                <div class="stat-label">HR</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${App.messages.length}</div>
                <div class="stat-label">Yhteensä</div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Add event listeners for news items
    container.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // If clicking on action buttons, don't toggle
            if (e.target.closest('.news-actions')) {
                const action = e.target.dataset.action;
                const id = item.dataset.id;
                if (action === 'edit') {
                    editMessage(id);
                } else if (action === 'delete') {
                    deleteMessage(id);
                } else if (action === 'toggle-main') {
                    toggleMainTopic(id);
                }
                return;
            }
            // Toggle expanded state
            item.classList.toggle('expanded');
        });
    });

    // Add event listeners for filter tabs
    container.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            App.currentFilter = tab.dataset.filter;
            renderNewsList();
        });
    });

    // Add event listener for info box edit button
    const editInfoBoxBtn = document.getElementById('edit-info-box-btn');
    if (editInfoBoxBtn) {
        editInfoBoxBtn.addEventListener('click', () => {
            openInfoBoxModal();
        });
    }
}

// Open modal for adding/editing
function openModal(message = null) {
    App.editingId = message ? message.id : null;
    
    document.getElementById('message-id').value = message ? message.id : '';
    document.getElementById('message-title').value = message ? message.title : '';
    document.getElementById('message-content').value = message ? message.content : '';
    document.getElementById('message-category').value = message ? message.category : 'johto';
    
    document.querySelector('.modal-title').textContent = message ? 'Muokkaa viestiä' : 'Lisää viesti';
    document.getElementById('message-modal').style.display = 'flex';
    document.getElementById('message-title').focus();
}

// Close modal
function closeModal() {
    document.getElementById('message-modal').style.display = 'none';
    document.getElementById('message-form').reset();
    App.editingId = null;
}

// Open info box edit modal
function openInfoBoxModal() {
    const modal = document.getElementById('infobox-modal');
    document.getElementById('infobox-text').value = App.infoBoxText;
    modal.style.display = 'flex';
    document.getElementById('infobox-text').focus();
}

// Close info box modal
function closeInfoBoxModal() {
    document.getElementById('infobox-modal').style.display = 'none';
}

// Handle info box form submission
function handleInfoBoxSubmit(e) {
    e.preventDefault();
    const newText = document.getElementById('infobox-text').value.trim();
    if (newText) {
        App.infoBoxText = newText;
        saveInfoBoxText();
    }
    closeInfoBoxModal();
    renderNewsList();
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('message-title').value.trim();
    const content = document.getElementById('message-content').value.trim();
    const category = document.getElementById('message-category').value;
    
    if (!title || !content) {
        return;
    }

    if (App.editingId) {
        // Update existing message
        const index = App.messages.findIndex(m => m.id === App.editingId);
        if (index !== -1) {
            App.messages[index].title = title;
            App.messages[index].content = content;
            App.messages[index].category = category;
            App.messages[index].updated = new Date().toISOString();
        }
    } else {
        // Create new message
        const newMessage = {
            id: generateId(),
            title: title,
            content: content,
            category: category,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        App.messages.push(newMessage);
    }
    
    saveMessages();
    closeModal();
    renderNewsList();
}

// Edit message
function editMessage(id) {
    const message = App.messages.find(m => m.id === id);
    if (message) {
        openModal(message);
    }
}

// Delete message
function deleteMessage(id) {
    if (confirm('Haluatko poistaa tämän viestin?')) {
        App.messages = App.messages.filter(m => m.id !== id);
        saveMessages();
        renderNewsList();
    }
}

// Toggle main topic status (only one per category)
function toggleMainTopic(id) {
    const message = App.messages.find(m => m.id === id);
    if (!message) return;
    
    if (message.isMainTopic) {
        // Unmark as main topic
        message.isMainTopic = false;
    } else {
        // Unmark any other main topic in the same category
        App.messages.forEach(m => {
            if (m.category === message.category) {
                m.isMainTopic = false;
            }
        });
        // Mark this message as main topic
        message.isMainTopic = true;
    }
    
    saveMessages();
    renderNewsList();
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours, show relative time
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) {
            const mins = Math.floor(diff / 60000);
            return mins < 1 ? 'Juuri nyt' : `${mins} min sitten`;
        }
        return `${hours} h sitten`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString('fi-FI', {
        day: 'numeric',
        month: 'numeric'
    });
}

// Get category display label
function getCategoryLabel(category) {
    const labels = {
        'johto': 'Johto',
        'tuotekehitys': 'Tuotekehitys',
        'it-tuki': 'IT-tuki',
        'turvallisuus': 'Turvallisuus',
        'hr': 'HR'
    };
    return labels[category] || category;
}

// Generate main topic badge HTML
function getMainTopicBadge(isMainTopic) {
    return isMainTopic ? '<span class="main-topic-badge">★</span>' : '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle fullscreen mode
function toggleFullscreen() {
    const isFullscreen = document.body.classList.contains('fullscreen-mode');
    
    if (isFullscreen) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

// Enter fullscreen mode
function enterFullscreen() {
    document.body.classList.add('fullscreen-mode');
    
    // Add exit button if not exists
    if (!document.getElementById('exit-fullscreen-btn')) {
        const exitBtn = document.createElement('button');
        exitBtn.id = 'exit-fullscreen-btn';
        exitBtn.className = 'exit-fullscreen-btn';
        exitBtn.textContent = '✕ Poistu fullscreen';
        exitBtn.setAttribute('aria-label', 'Poistu fullscreen-näkymästä');
        exitBtn.addEventListener('click', exitFullscreen);
        document.body.appendChild(exitBtn);
    }
    
    // Expand all news items to show content
    document.querySelectorAll('.news-item').forEach(item => {
        item.classList.add('expanded');
    });
}

// Exit fullscreen mode
function exitFullscreen() {
    document.body.classList.remove('fullscreen-mode');
    
    // Remove exit button
    const exitBtn = document.getElementById('exit-fullscreen-btn');
    if (exitBtn) {
        exitBtn.remove();
    }
    
    // Collapse all news items
    document.querySelectorAll('.news-item').forEach(item => {
        item.classList.remove('expanded');
    });
}
