// Funcionalidad Principal: AniVibe / SECURE_ACCESS adaptado a Backend Node.js
if (typeof API_URL === 'undefined') {
    window.API_URL = 'http://localhost:3000/api';
}

// Sobrescritura de Alertas Nativas con Modal Premium
window.alert = function(msg) {
    $('#customAlertModal').remove();
    const modalHtml = `
    <div class="modal fade" id="customAlertModal" tabindex="-1" aria-hidden="true" style="backdrop-filter: blur(5px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-white" style="background:linear-gradient(145deg, #130e24, #0a0614); border: 1px solid rgba(255,100,150,0.3); border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.6);">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" style="letter-spacing:0.15em; color:var(--primary); font-family:'Space Grotesk', sans-serif;">// Sakura</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4 text-center">
            <p class="mb-0 fs-5" style="font-family:'Space Grotesk', sans-serif; letter-spacing:0.02em;">${msg}</p>
          </div>
          <div class="modal-footer border-0 pt-0 justify-content-center">
            <button type="button" class="btn fw-bold text-white px-5 text-uppercase" style="background:var(--accent); border-radius:8px; letter-spacing:0.1em;" data-bs-dismiss="modal">Entendido</button>
          </div>
        </div>
      </div>
    </div>`;
    $('body').append(modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('customAlertModal'));
    modal.show();
};

/** El sitio usa solo páginas *-bootstrap.html (variantes .html legacy eliminadas). */
function usingBootstrapPages() {
    return true;
}

/** Nombre lógico -> archivo en /html (ej. 'login' -> login-bootstrap.html). */
function sitePage(stem) {
    return stem + '-bootstrap.html';
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/** Reseñas y me gusta solo en el navegador (sin API /articles en el servidor). */
function readLocalArticlesList() {
    try {
        const arr = JSON.parse(localStorage.getItem('articles'));
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function writeLocalArticlesList(arr) {
    localStorage.setItem('articles', JSON.stringify(arr || []));
}

function updateLocalArticleById(id, fields) {
    const list = readLocalArticlesList();
    const idx = list.findIndex(function (a) {
        return String(a.id != null ? a.id : a._id) === String(id);
    });
    if (idx === -1) return false;
    Object.keys(fields).forEach(function (k) {
        list[idx][k] = fields[k];
    });
    writeLocalArticlesList(list);
    return true;
}

function deleteLocalArticleById(id) {
    const next = readLocalArticlesList().filter(function (a) {
        return String(a.id != null ? a.id : a._id) !== String(id);
    });
    writeLocalArticlesList(next);
    pruneArticleLikesLocal(id);
}

const SAKURA_LIKES_KEY = 'sakura_article_likes_v1';

function getSakuraLikesUserKey() {
    try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return '_anon';
        const u = JSON.parse(raw);
        return String(u.email || u.id || u.name || '_anon');
    } catch (e) {
        return '_anon';
    }
}

function readLikesStore() {
    try {
        const o = JSON.parse(localStorage.getItem(SAKURA_LIKES_KEY) || 'null');
        if (!o || typeof o !== 'object') return { tally: {}, votes: {} };
        return {
            tally: typeof o.tally === 'object' && o.tally ? o.tally : {},
            votes: typeof o.votes === 'object' && o.votes ? o.votes : {}
        };
    } catch (e) {
        return { tally: {}, votes: {} };
    }
}

function writeLikesStore(store) {
    localStorage.setItem(SAKURA_LIKES_KEY, JSON.stringify(store));
}

function pruneArticleLikesLocal(articleId) {
    const aid = String(articleId);
    const store = readLikesStore();
    delete store.tally[aid];
    Object.keys(store.votes).forEach(function (uk) {
        if (store.votes[uk] && store.votes[uk][aid]) delete store.votes[uk][aid];
    });
    writeLikesStore(store);
}

/** ID de reseña en botones/enlaces (jQuery convierte data-article-id → data('articleId')). */
function getDataArticleId($el) {
    if (!$el || !$el.length) return '';
    const fromAttr = $el.attr('data-article-id');
    if (fromAttr != null && String(fromAttr).trim() !== '') return String(fromAttr).trim();
    const camel = $el.data('articleId');
    if (camel != null && String(camel).trim() !== '') return String(camel).trim();
    const legacy = $el.data('article-id');
    if (legacy != null && String(legacy).trim() !== '') return String(legacy).trim();
    return '';
}

/** Resumen de me gusta en localStorage (un voto por usuario y reseña). */
async function fetchLikesSummary() {
    const store = readLikesStore();
    const userKey = getSakuraLikesUserKey();
    const myVotes =
        store.votes[userKey] && typeof store.votes[userKey] === 'object' ? store.votes[userKey] : {};
    const summary = {};
    Object.keys(store.tally).forEach(function (aid) {
        summary[String(aid)] = {
            likeCount: Number(store.tally[aid]) || 0,
            likedByMe: !!myVotes[aid]
        };
    });
    Object.keys(myVotes).forEach(function (aid) {
        if (!summary[aid]) {
            summary[aid] = {
                likeCount: Number(store.tally[aid]) || 0,
                likedByMe: true
            };
        }
    });
    return { summary: summary };
}

async function fetchArticleLikes(articleId) {
    const id = String(articleId || '').trim();
    if (!id) return { likeCount: 0, likedByMe: false };
    const data = await fetchLikesSummary();
    const s = (data.summary && data.summary[id]) || { likeCount: 0, likedByMe: false };
    return { likeCount: s.likeCount, likedByMe: s.likedByMe };
}

/** Toggle me gusta en el navegador. Requiere sesión (currentUser). */
async function postToggleArticleLike(articleId) {
    const id = String(articleId || '').trim();
    if (!id) return { error: 'other' };
    const userKey = getSakuraLikesUserKey();
    if (userKey === '_anon') return { error: 'auth' };
    const store = readLikesStore();
    if (!store.votes[userKey]) store.votes[userKey] = {};
    const had = !!store.votes[userKey][id];
    if (!store.tally[id]) store.tally[id] = 0;
    if (had) {
        delete store.votes[userKey][id];
        store.tally[id] = Math.max(0, (Number(store.tally[id]) || 0) - 1);
        if (store.tally[id] === 0) delete store.tally[id];
    } else {
        store.votes[userKey][id] = true;
        store.tally[id] = (Number(store.tally[id]) || 0) + 1;
    }
    writeLikesStore(store);
    const likeCount = Number(store.tally[id]) || 0;
    return { likeCount: likeCount, likedByMe: !had };
}

function syncLikeButton($btn, articleId, state) {
    if (!$btn || !$btn.length) return;
    const id = String(articleId);
    const liked = state ? !!state.likedByMe : false;
    const count =
        state && state.likeCount != null && state.likeCount !== ''
            ? Number(state.likeCount)
            : 0;
    const n = Number.isFinite(count) ? count : 0;
    const $icon = $btn.find('.ab-like-icon').first();
    if ($icon.length) $icon.text(liked ? 'favorite' : 'favorite_border');
    $btn.toggleClass('ab-like-btn--active', liked);
    $btn.attr('aria-pressed', liked ? 'true' : 'false');
    $btn.find('.ab-like-count').first().text(n);
    $btn.attr(
        'aria-label',
        liked
            ? `Quitar me gusta. A ${n} ${n === 1 ? 'persona le' : 'personas les'} gusta esta reseña.`
            : `Me gusta. A ${n} ${n === 1 ? 'persona le' : 'personas les'} gusta esta reseña.`
    );
}

async function applyLikesSummaryToGrid($grid) {
    const data = await fetchLikesSummary();
    if (!$grid || !$grid.length || !data || data.summary == null) return;
    const summary = {};
    Object.keys(data.summary).forEach((k) => {
        summary[String(k)] = data.summary[k];
    });
    $grid.find('.ab-like-btn').each(function () {
        const id = getDataArticleId($(this));
        if (!id) return;
        const s = summary[id] || { likeCount: 0, likedByMe: false };
        syncLikeButton($(this), id, s);
    });
}

async function fetchArticlesCollection() {
    return readLocalArticlesList();
}

/**
 * Ajustes (solo front): lista, edición y borrado de reseñas del usuario.
 * Se invoca desde ajustes-bootstrap.html tras comprobar sesión.
 */
window.initSakuraAjustesMyReviews = function (currentUser) {
    const byId = function (id) {
        return document.getElementById(id);
    };
    if (!currentUser || !byId('view-mis-resenas')) return null;

    let editReviewModalInstance = null;
    function getEditReviewModal() {
        if (!editReviewModalInstance) {
            const el = byId('editReviewModal');
            if (el && typeof bootstrap !== 'undefined') {
                editReviewModalInstance = new bootstrap.Modal(el);
            }
        }
        return editReviewModalInstance;
    }

    let cachedMyReviews = [];

    function formatReviewDate(ms) {
        if (!ms) return '—';
        try {
            return new Date(ms).toLocaleDateString('es', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return '—';
        }
    }

    async function loadMyReviews() {
        const listEl = byId('my-reviews-list');
        const emptyEl = byId('my-reviews-empty');
        const loadingEl = byId('my-reviews-loading');
        if (!listEl || !emptyEl) return;

        const myName = (currentUser.name || '').trim();
        if (loadingEl) loadingEl.classList.remove('d-none');
        listEl.innerHTML = '';

        const all = await fetchArticlesCollection();
        const mine = all.filter(function (a) {
            return (a.author || '').trim() === myName;
        });
        mine.sort(function (x, y) {
            return getArticleSortTime(y) - getArticleSortTime(x);
        });
        cachedMyReviews = mine;

        if (loadingEl) loadingEl.classList.add('d-none');

        if (!mine.length) {
            emptyEl.classList.remove('d-none');
            return;
        }
        emptyEl.classList.add('d-none');

        mine.forEach(function (a) {
            const id = a.id != null ? a.id : a._id;
            if (id == null) return;
            const sid = String(id);
            const excerpt = (a.content || '').replace(/\s+/g, ' ').trim().slice(0, 160);
            const when = formatReviewDate(getArticleSortTime(a));
            const card = document.createElement('div');
            card.className = 'p-3 p-md-4 rounded-3';
            card.style.cssText = 'background:rgba(0,0,0,.35); border:1px solid var(--outline);';
            card.innerHTML =
                '<p class="mb-2 text-uppercase sakura-muted" style="font-size:10px; letter-spacing:0.14em;">' +
                escapeHtml(a.category || 'Reseña') +
                ' · ' +
                escapeHtml(when) +
                '</p>' +
                '<h3 class="h6 text-white fw-bold mb-2">' +
                escapeHtml(a.title || 'Sin título') +
                '</h3>' +
                '<p class="sakura-muted small mb-3 mb-md-4" style="line-height:1.5;">' +
                escapeHtml(excerpt) +
                ((a.content || '').length > 160 ? '…' : '') +
                '</p>' +
                '<div class="d-flex flex-wrap gap-2">' +
                '<a class="btn btn-sm btn-outline-light text-uppercase fw-bold" style="font-size:10px; letter-spacing:0.14em;" href="' +
                sitePage('article') +
                '?id=' +
                encodeURIComponent(sid) +
                '">Ver</a>' +
                '<button type="button" class="btn btn-sm sakura-primary-btn text-uppercase fw-bold js-myreview-edit" style="font-size:10px; letter-spacing:0.14em;" data-review-id="' +
                escapeHtml(sid) +
                '">Editar</button>' +
                '<button type="button" class="btn btn-sm btn-outline-danger text-uppercase fw-bold js-myreview-delete" style="font-size:10px; letter-spacing:0.14em;" data-review-id="' +
                escapeHtml(sid) +
                '">Eliminar</button>' +
                '</div>';
            listEl.appendChild(card);
        });
    }

    const viewMisResenas = byId('view-mis-resenas');
    if (viewMisResenas) {
        viewMisResenas.addEventListener('click', async function (e) {
            const delBtn = e.target.closest('.js-myreview-delete');
            const editBtn = e.target.closest('.js-myreview-edit');
            if (delBtn) {
                const id = delBtn.getAttribute('data-review-id');
                if (!id || !confirm('¿Seguro que quieres eliminar esta reseña?')) return;
                deleteLocalArticleById(id);
                alert('Reseña eliminada.');
                loadMyReviews();
                return;
            }
            if (editBtn) {
                const id = editBtn.getAttribute('data-review-id');
                const article = cachedMyReviews.find(function (x) {
                    return String(x.id != null ? x.id : x._id) === String(id);
                });
                if (!article || !byId('editReviewId')) return;
                byId('editReviewId').value = String(id);
                byId('editReviewTitle').value = article.title || '';
                byId('editReviewContent').value = article.content || '';
                const cat = (article.category || 'Sin Categoría').trim();
                const sel = byId('editReviewCategory');
                const hasOpt = Array.from(sel.options).some(function (o) {
                    return o.value === cat;
                });
                sel.value = hasOpt ? cat : 'Sin Categoría';
                const modal = getEditReviewModal();
                if (modal) modal.show();
            }
        });
    }

    const editReviewSaveBtn = byId('editReviewSaveBtn');
    if (editReviewSaveBtn) {
        editReviewSaveBtn.addEventListener('click', async function () {
            const id = (byId('editReviewId') && byId('editReviewId').value) || '';
            const title = (byId('editReviewTitle') && byId('editReviewTitle').value.trim()) || '';
            const content = (byId('editReviewContent') && byId('editReviewContent').value.trim()) || '';
            const category = (byId('editReviewCategory') && byId('editReviewCategory').value) || 'Sin Categoría';
            if (!id) return;
            if (!title || !content) {
                alert('El título y el contenido no pueden estar vacíos.');
                return;
            }
            if (updateLocalArticleById(id, { title: title, content: content, category: category })) {
                const modal = getEditReviewModal();
                if (modal) modal.hide();
                alert('Reseña actualizada correctamente.');
                loadMyReviews();
            } else {
                alert('No se pudo guardar la reseña.');
            }
        });
    }

    return { loadMyReviews: loadMyReviews };
};

function getArticleSortTime(article) {
    const raw = article.created_at || article.date || article.updated_at;
    if (!raw) return 0;
    const t = new Date(raw).getTime();
    return Number.isNaN(t) ? 0 : t;
}

function formatRelativeTimeEs(ms) {
    if (!ms) return 'Reciente';
    const diff = Date.now() - ms;
    if (diff < 0) return 'Reciente';
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);
    if (min < 1) return 'Ahora';
    if (min < 60) return min === 1 ? 'Hace 1 min' : `Hace ${min} min`;
    if (hr < 24) return hr === 1 ? 'Hace 1 h' : `Hace ${hr} h`;
    if (day === 1) return 'Ayer';
    if (day < 7) return `Hace ${day} días`;
    return new Date(ms).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ULTIMO_FEED_ROW_THEMES = [
    { border: 'var(--primary-bright)' },
    { border: 'var(--accent-hot)' },
    { border: 'var(--accent)' },
    { border: 'var(--outline)' }
];

$(document).ready(function () {
    console.log("Sistema Iniciado: AniVibe / SECURE_ACCESS conectado a Backend");

    try {
        const rm = localStorage.getItem('sakura_reduce_motion');
        if (rm === '1') document.documentElement.classList.add('reduce-motion');
        const th = localStorage.getItem('sakura_theme');
        if (th === 'light') document.documentElement.classList.remove('dark');
        else if (th === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}

    // Initialize mock database in localStorage if empty (Fallback)
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            { id: 1, name: 'Admin', email: 'admin@curator.com', password: 'admin', role: 'ADMIN' },
            { id: 2, name: 'Normal User', email: 'user@curator.com', password: 'user', role: 'USER' }
        ]));
    }
    if (!localStorage.getItem('articles')) {
        localStorage.setItem('articles', JSON.stringify([
            { id: 1, title: 'The Visual Mastery of Studio Ghibli', category: 'Seinen', content: 'Color theory and animation techniques...', author: 'Admin', date: new Date().toISOString() },
            { id: 2, title: 'Cyberpunk Edgerunners & Urban Aesthetic', category: 'Shonen', content: 'Neon palettes and Night City...', author: 'Normal User', date: new Date().toISOString() },
            { id: 11, title: 'Solo Leveling: Final Analysis', category: 'Shonen', content: 'Evaluating the impact of the shadow monarch...', author: 'Admin', date: new Date().toISOString() }
        ]));
    }
    if (!localStorage.getItem('comments')) {
        localStorage.setItem('comments', JSON.stringify([
            { id: 1, user: "Kira_99", text: "Excelente reseña.", status: "APPROVED" },
            { id: 2, user: "Bot_77", text: "Gana dinero fácil.", status: "SPAM" }
        ]));
    }

    // Funciones globales para botones dinámicos
    window.deleteUser = async function (email) {
        if (confirm("¿Seguro que deseas eliminar este usuario?")) {
            try {
                const res = await fetch(`${API_URL}/users/${email}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    alert("Usuario eliminado.");
                    if (typeof renderUsersTable === 'function') renderUsersTable();
                    else setTimeout(() => window.location.reload(), 1500);
                } else {
                    const error = await res.json();
                    alert(error.message || "Error eliminando usuario.");
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    window.changeRole = async function (email) {
        try {
            const res = await fetch(`${API_URL}/users/role/${email}`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const error = await res.json();
                alert(error.message || "Error al cambiar rol");
            }
        } catch (e) {
            console.error(e);
        }
    };

    window.deleteArticle = async function (id) {
        if (confirm("¿Seguro que deseas eliminar este proyecto/artículo?")) {
            deleteLocalArticleById(id);
            alert("Proyecto eliminado.");
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    // ===== Lógica de Login (SECURE_ACCESS) =====
    const $loginForm = $('#loginForm');
    if ($loginForm.length) {
        $loginForm.on('submit', async function (e) {
            e.preventDefault();
            const inputs = $loginForm.find('input');
            const email = $(inputs[0]).val();
            const password = $(inputs[1]).val();

            const $btn = $loginForm.find('button');
            const $btnContent = $btn.find('span') || $btn;
            const originalHTML = $btnContent.html();

            $btn.prop('disabled', true);
            $btnContent.html('Verificando... <span class="material-symbols-outlined text-xl animate-spin">refresh</span>');
            $btn.addClass('opacity-80 cursor-not-allowed');

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    const target = data.user.role === 'ADMIN' ? sitePage('admin') : sitePage('index');
                    window.location.href = target;
                } else {
                    alert('CREDENCIALES INVÁLIDAS. ACCESO DENEGADO.');
                    $btnContent.html(originalHTML);
                    $btn.prop('disabled', false);
                    $btn.removeClass('opacity-80 cursor-not-allowed');
                }
            } catch (err) {
                alert('No se pudo conectar al servidor.');
                $btnContent.html(originalHTML);
                $btn.prop('disabled', false);
                $btn.removeClass('opacity-80 cursor-not-allowed');
            }
        });
    }

    // ===== Lógica de Registro =====
    const $registerForm = $('#registerForm');
    if ($registerForm.length) {
        $registerForm.on('submit', async function (e) {
            e.preventDefault();
            const fullname = $('#fullname').val();
            const email = $('#email').val();
            const password = $('#password').val();
            const confirmPassword = $('#confirmPassword').val();

            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            const $btn = $registerForm.find('button');
            const $btnContent = $btn.find('span') || $btn;
            const originalHTML = $btnContent.html();

            $btn.prop('disabled', true);
            $btnContent.html('Registrando... <span class="material-symbols-outlined text-xl animate-spin">refresh</span>');

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: fullname, email, password })
                });

                if (res.ok) {
                    alert('Registro exitoso. Serás redirigido al login.');
                    window.location.href = sitePage('login');
                } else {
                    const error = await res.json();
                    alert(error.message || 'Error en el registro');
                    $btnContent.html(originalHTML);
                    $btn.prop('disabled', false);
                }
            } catch (err) {
                alert('No se pudo conectar al servidor.');
                $btnContent.html(originalHTML);
                $btn.prop('disabled', false);
            }
        });
    }

    // ===== Lógica de Recuperación de Contraseña =====
    // Manejada directamente en forgot-password-bootstrap.html via AJAX al backend.

    // ===== Lógica GLOBAL para Auth y Perfil en Navbar =====
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const $authSection = $('#auth-section');

    if (currentUser && $authSection.length) {
        function escHtml(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        }
        
        $authSection.html(`
            <div class="dropdown ms-md-3 mt-3 mt-md-0 d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-light dropdown-toggle text-uppercase fw-bold" style="letter-spacing:0.14em;font-size:11px;" data-bs-toggle="dropdown" aria-expanded="false">${escHtml(currentUser.name)}</button>
                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-white/10">
                    <li><h6 class="dropdown-header text-primary tracking-widest uppercase" style="font-size:9px;">${escHtml(currentUser.role)}</h6></li>
                    <li><a class="dropdown-item" href="${sitePage('ajustes')}">Ajustes</a></li>
                    ${currentUser.role === 'ADMIN' ? `<li><a class="dropdown-item fw-bold text-accent" href="${sitePage('admin')}">Panel Admin</a></li>` : `<li><a class="dropdown-item" href="${sitePage('panel_escritor')}">Escribir Reseña</a></li>`}
                    <li><hr class="dropdown-divider"></li>
                    <li><button type="button" class="dropdown-item text-danger" id="logoutBtn">Cerrar sesión</button></li>
                </ul>
            </div>`);

        $('#logoutBtn').on('click', async function () {
            try {
                await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
            } catch(e) {}
            localStorage.removeItem('currentUser');
            window.location.reload();
        });

        $('button:contains("SUSCRÍBETE_AHORA")').parent().hide();
        $('aside a[href*="register"]').closest('div.mt-auto, div.px-3').hide();
    }

    // ===== Lógica para el Navbar Público (Index) =====
    const isIndex = /\/index-bootstrap\.html(\?|$)/i.test(window.location.pathname) || window.location.pathname.endsWith('/');
    if (isIndex) {

        const $articlesGrid = $('.lg\\:col-span-8 .grid.grid-cols-1.md\\:grid-cols-2.gap-12');
        if ($articlesGrid.length) {
            async function loadReviews() {
                try {
                    const dbArticles = await fetchArticlesCollection();
                    let displayArticles = [...dbArticles];

                    // Llamada a API externa como fallback (AnimeAPIPlatform) 
                    if (!currentUser || currentUser.role !== 'USER') {
                        try {
                            const premiumRes = await fetch('https://www.animeapiplatform.com/api/v1/anime', {
                                headers: { 'Authorization': 'Bearer sk-8deebbe3cf4bb33e429149b8999f287c6e99fc3be63f35d4' }
                            });
                            const apiData = await premiumRes.json();
                            const topAnimes = apiData.data ? apiData.data.slice(0, 6) : [];
                            const apiReviews = topAnimes.map(anime => ({
                                id: anime.id * 1000,
                                title: anime.title,
                                author: "AnimeAPI",
                                category: anime.type || "Tendencia",
                                content: `Status: ${anime.status}. Etiquetas: ${anime.tags ? anime.tags.slice(0,3).join(',') : 'Anime'}.`,
                                image: anime.picture || "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1080&auto=format&fit=crop"
                            }));
                            displayArticles = [...displayArticles, ...apiReviews];
                        } catch (e) { console.warn('API fallback failed'); }
                    }

                    $articlesGrid.empty();

                    if (displayArticles.length > 0) {
                        displayArticles.forEach(article => {
                            const deleteBtn = (currentUser && currentUser.role === 'ADMIN' && article.id < 1000000) ? `<button onclick="event.stopPropagation(); deleteArticle(${article.id})" class="absolute top-4 right-4 bg-error text-white font-bold p-2 rounded-full hover:scale-110 z-20"><span class="material-symbols-outlined text-sm">delete</span></button>` : '';
                            
                            const articleHTML = `
                                <article class="space-y-4 group cursor-pointer relative bg-surface-container hover:bg-surface-container-high p-5 h-100 d-flex flex-column transition-colors" onclick="window.location.href='${sitePage('article')}?id=${article.id}'">
                                    ${deleteBtn}
                                    <h4 class="font-headline text-2xl font-bold text-white leading-tight uppercase truncate">${article.title}</h4>
                                    <div class="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                                        <p class="text-[10px] font-headline tracking-widest text-primary uppercase">AUTOR // ${article.author}</p>
                                        <span class="bg-surface-container-highest px-2 py-1 text-[10px] text-tertiary font-bold tracking-widest uppercase">${article.category || 'RESEÑA'}</span>
                                    </div>
                                    <p class="text-xs text-on-surface-variant leading-relaxed flex-grow-1">${article.content.substring(0, 300) + '...'}</p>
                                </article>
                            `;
                            $articlesGrid.append(articleHTML);
                        });
                    } else if (currentUser && currentUser.role === 'USER') {
                        $articlesGrid.html('<p class="text-tertiary font-headline tracking-widest uppercase text-sm">AÚN NO HAS ESCRITO NINGÚN DOCUMENTO DE ANÁLISIS.</p>');
                    }
                } catch(e) { console.error("Error fetching articles", e); }
            }
            loadReviews();
        }

        const $searchInputs = $('nav input[type="text"]');
        $searchInputs.on('keyup', function () {
            const val = $(this).val().toLowerCase();
            $('.lg\\:col-span-8 article').each(function () {
                const title = $(this).find('h4').text().toLowerCase();
                $(this).toggle(title.indexOf(val) > -1);
            });
        });
    }

    // ===== Panel escritor: selector de categoría (lista personalizada) =====
    const $writerCategoryPicker = $('#writerCategoryPicker');
    if ($writerCategoryPicker.length) {
        const $catSelect = $('#category');
        const $catTrigger = $('#categorySelectBtn');
        const $catDropdown = $('#categoryDropdown');
        const $catList = $('#categoryList');
        const $catDisplay = $('#categoryDisplayText');
        const $catSearch = $('#categorySearchInput');

        $catSelect.find('option').each(function () {
            const $opt = $(this);
            const val = $opt.attr('value');
            if (val == null || val === '') return;
            const label = ($opt.text() || val).trim();
            const $btn = $(
                '<button type="button" class="ab-category-picker__opt" role="option"></button>'
            );
            $btn.attr('data-value', val).text(label);
            $catList.append($('<li class="mb-0"></li>').append($btn));
        });

        function setPickerOpen(open) {
            $writerCategoryPicker.toggleClass('ab-category-picker--open', open);
            $catTrigger.attr('aria-expanded', open ? 'true' : 'false');
            $catDropdown.prop('hidden', !open);
        }

        function closePicker() {
            setPickerOpen(false);
            $catSearch.val('');
            $catList.find('.ab-category-picker__opt').removeAttr('hidden');
        }

        function selectCategory(value, labelText) {
            $catSelect.val(value);
            $catDisplay.text(labelText);
            $catList.find('.ab-category-picker__opt').removeClass('is-active');
            $catList.find('.ab-category-picker__opt[data-value="' + $.escapeSelector(value) + '"]').addClass('is-active');
            closePicker();
        }

        $catTrigger.on('click', function (e) {
            e.preventDefault();
            const open = !$writerCategoryPicker.hasClass('ab-category-picker--open');
            setPickerOpen(open);
            if (open) {
                setTimeout(function () {
                    $catSearch.trigger('focus');
                }, 0);
            }
        });

        $catList.on('click', '.ab-category-picker__opt', function () {
            const $b = $(this);
            const v = $b.attr('data-value');
            if (!v) return;
            selectCategory(v, $b.text().trim());
        });

        $catSearch.on('input', function () {
            const q = $(this).val().toLowerCase().trim();
            $catList.find('.ab-category-picker__opt').each(function () {
                const t = $(this).text().toLowerCase();
                if (q && t.indexOf(q) === -1) $(this).attr('hidden', 'hidden');
                else $(this).removeAttr('hidden');
            });
        });

        $(document).on('click.writerCategoryPicker', function (e) {
            if (!$writerCategoryPicker[0].contains(e.target)) closePicker();
        });

        $(document).on('keydown.writerCategoryPicker', function (e) {
            if (e.key === 'Escape' && $writerCategoryPicker.hasClass('ab-category-picker--open')) {
                closePicker();
                $catTrigger.trigger('focus');
            }
        });
    }

    // ===== Lógica de Write Article =====
    const $writeArticleForm = $('#writeArticleForm');
    if ($writeArticleForm.length) {
        const $wTitle = $('#title');
        const $wContent = $('#content');
        const $wTitleCount = $('#writerTitleCount');
        const $wContentCount = $('#writerContentCount');
        const $wReadEst = $('#writerReadEstimate');

        function refreshWriterPanelStats() {
            if ($wTitleCount.length) {
                const n = ($wTitle.val() || '').length;
                $wTitleCount.text(n + ' / 200');
            }
            if ($wContentCount.length) {
                const c = ($wContent.val() || '').length;
                $wContentCount.text(c.toLocaleString('es') + ' caracteres');
            }
            if ($wReadEst.length) {
                const words = ($wContent.val() || '').trim().split(/\s+/).filter(Boolean).length;
                if (!words) {
                    $wReadEst.text('—');
                } else {
                    const min = Math.max(1, Math.round(words / 190));
                    $wReadEst.text('~' + min + ' min lectura');
                }
            }
        }
        $wTitle.on('input', refreshWriterPanelStats);
        $wContent.on('input', refreshWriterPanelStats);
        refreshWriterPanelStats();

        const $coverHidden = $('#image');
        const $coverUrl = $('#writerCoverUrl');
        const $coverFile = $('#writerCoverFile');
        const $coverPreview = $('#writerCoverPreview');
        const $coverPreviewWrap = $('#writerCoverPreviewWrap');
        const $coverClear = $('#writerCoverClear');

        function writerCoverSetPreview(src) {
            if (!$coverPreview.length) return;
            if (src) {
                $coverPreview.attr('src', src).attr('alt', 'Vista previa de portada');
                if ($coverPreviewWrap.length) $coverPreviewWrap.removeClass('d-none');
            } else {
                if ($coverPreviewWrap.length) $coverPreviewWrap.addClass('d-none');
                $coverPreview.removeAttr('src').removeAttr('alt');
            }
        }

        if ($coverHidden.length) {
            if ($coverUrl.length) {
                $coverUrl.on('input', function () {
                    const v = $(this).val().trim();
                    $coverHidden.val(v);
                    if ($coverFile.length) $coverFile.val('');
                    writerCoverSetPreview(v || '');
                });
            }
            if ($coverFile.length) {
                $coverFile.on('change', function () {
                    const file = this.files && this.files[0];
                    if (!file) return;
                    if (!/^image\//.test(file.type)) {
                        alert('Elige un archivo de imagen (JPG, PNG, WebP o GIF).');
                        $(this).val('');
                        return;
                    }
                    const maxBytes = Math.floor(1.5 * 1024 * 1024);
                    if (file.size > maxBytes) {
                        alert('La imagen supera 1,5 MB. Reduce tamaño o usa una URL.');
                        $(this).val('');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function () {
                        const dataUrl = reader.result;
                        $coverHidden.val(dataUrl);
                        if ($coverUrl.length) $coverUrl.val('');
                        writerCoverSetPreview(dataUrl);
                    };
                    reader.readAsDataURL(file);
                });
            }
            if ($coverClear.length) {
                $coverClear.on('click', function () {
                    $coverHidden.val('');
                    if ($coverUrl.length) $coverUrl.val('');
                    if ($coverFile.length) $coverFile.val('');
                    writerCoverSetPreview('');
                });
            }
        }

        $writeArticleForm.on('submit', async function (e) {
            e.preventDefault();
            const title = $('#title').val();
            const catVal = $('#category').val();
            if (!catVal) {
                alert('Elige una categoría para tu reseña.');
                $('#categorySelectBtn').trigger('focus');
                return;
            }
            const category = catVal || 'Sin Categoría';
            const content = $('#content').val();
            const image = $('#image').length ? $('#image').val() : '';

            const $submitBtn = $('#writerSubmitBtn');
            $submitBtn.prop('disabled', true).html(
                '<span class="material-symbols-outlined animate-spin" style="font-size:20px;" translate="no">progress_activity</span><span>Publicando…</span>'
            );

            const localArticles = readLocalArticlesList();
            const newId = Date.now();
            localArticles.unshift({
                id: newId,
                title,
                category,
                content,
                image: image || '',
                author: currentUser?.name || 'Usuario',
                date: new Date().toISOString()
            });
            writeLocalArticlesList(localArticles);
            alert('Reseña publicada correctamente.');
            window.location.href = sitePage('article');
        });
    }

    // ===== Lógica Viewing Article =====
    const isArticleView = /\/article(\?|$)/i.test(window.location.pathname) || /\/article-bootstrap\.html(\?|$)/i.test(window.location.pathname);
    if (isArticleView) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        const $listView = $('#article-list-view');
        const $detailView = $('#article-detail-view');
        const $reviewsGrid = $('#reviews-grid');

        async function getArticleById(articleIdValue) {
            try {
                const cachedArticle = JSON.parse(sessionStorage.getItem('selectedArticleForRead') || 'null');
                const cachedId = cachedArticle?.id ?? cachedArticle?._id;
                if (cachedArticle && String(cachedId) === String(articleIdValue)) {
                    return cachedArticle;
                }
            } catch (e) {}

            const localArticles = readLocalArticlesList();
            return localArticles.find(a => String(a.id) === String(articleIdValue)) || null;
        }

        function renderReviewsList(articles) {
            if (!$reviewsGrid.length) return;
            $reviewsGrid.empty();
            if (!articles.length) {
                $reviewsGrid.html('<div class="col-12"><div class="sakura-card p-4"><p class="mb-0 text-muted-admin">Aun no hay reseñas publicadas.</p></div></div>');
                return;
            }

            articles.forEach(article => {
                const articleKey = article.id ?? article._id;
                if (!articleKey) return;
                $reviewsGrid.append(`
                    <div class="col-12 col-md-6">
                        <article class="sakura-card p-4 h-100 d-flex flex-column">
                            <p class="mb-2 article-meta">${escapeHtml(article.category || 'Reseña')}</p>
                            <h3 class="h5 text-white font-headline fw-bold mb-2">${escapeHtml(article.title || 'Sin título')}</h3>
                            <p class="text-muted-admin mb-3 ab-review-card-excerpt flex-grow-1">${escapeHtml(article.content || '')}</p>
                            <div class="d-flex justify-content-between align-items-center mt-auto pt-1 flex-wrap gap-2">
                                <small class="text-muted-admin">By: ${escapeHtml(article.author || 'Autor')}</small>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn ab-like-btn p-1 d-inline-flex align-items-center gap-1 border-0" data-article-id="${String(articleKey)}" aria-pressed="false" aria-label="Me gusta">
                                        <span class="material-symbols-outlined ab-like-icon" translate="no">favorite_border</span>
                                        <span class="ab-like-count small text-muted-admin mb-0">0</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                `);
            });

            applyLikesSummaryToGrid($reviewsGrid);

            $reviewsGrid.off('click.sakuraLike').on('click.sakuraLike', '.ab-like-btn', async function (e) {
                e.preventDefault();
                e.stopPropagation();
                const $b = $(this);
                const id = getDataArticleId($b);
                if (!id) return;
                const result = await postToggleArticleLike(id);
                if (result && result.error === 'auth') {
                    alert(
                        'Inicia sesión para dar me gusta. Cada cuenta puede votar solo una vez por reseña; el número muestra cuántas personas les gusta.'
                    );
                    return;
                }
                if (result && result.error) {
                    alert('No se pudo registrar el me gusta. Inicia sesión para votar.');
                    return;
                }
                if (result && result.likeCount !== undefined) {
                    syncLikeButton($b, id, {
                        likeCount: result.likeCount,
                        likedByMe: !!result.likedByMe
                    });
                }
            });

            $reviewsGrid.find('.read-review-link').on('click', function () {
                const targetId = getDataArticleId($(this));
                const selected = articles.find(a => String(a.id ?? a._id) === String(targetId));
                if (selected) {
                    sessionStorage.setItem('selectedArticleForRead', JSON.stringify(selected));
                }
            });
        }

        if (articleId) {
            $listView.addClass('d-none');
            $detailView.removeClass('d-none');
            getArticleById(articleId)
                .then(article => {
                    if (article) {
                        $('#article-title').text(article.title);
                        $('#article-author').text("By: " + article.author);
                        $('#article-content').text(article.content);
                        const $coverWrap = $('#article-cover-wrap');
                        const $coverImg = $('#article-cover');
                        if (article.image && $coverImg.length) {
                            $coverImg.attr('src', article.image).attr('alt', 'Portada: ' + (article.title || 'reseña'));
                            $coverWrap.removeClass('d-none');
                        } else if ($coverWrap.length) {
                            $coverWrap.addClass('d-none');
                            $coverImg.removeAttr('src');
                        }

                        const likeKey = String(article.id ?? article._id ?? articleId);
                        const $likeBtn = $('#article-like-btn');
                        $likeBtn.removeClass('d-none');
                        fetchArticleLikes(likeKey).then((likeData) => {
                            syncLikeButton(
                                $likeBtn,
                                likeKey,
                                likeData || { likeCount: 0, likedByMe: false }
                            );
                        });
                        $likeBtn.off('click.sakuraLikeDetail').on('click.sakuraLikeDetail', async function (e) {
                            e.preventDefault();
                            const result = await postToggleArticleLike(likeKey);
                            if (result && result.error === 'auth') {
                                alert(
                                    'Inicia sesión para dar me gusta. Cada cuenta puede votar solo una vez por reseña; el número es cuántas personas les gusta.'
                                );
                                return;
                            }
                            if (result && result.likeCount != null) {
                                syncLikeButton($likeBtn, likeKey, {
                                    likeCount: result.likeCount,
                                    likedByMe: !!result.likedByMe
                                });
                            }
                        });

                        const canManageArticle = !!currentUser && (
                            currentUser.role === 'ADMIN' || currentUser.role === 'USER'
                        );

                        if (canManageArticle) {
                            $('#article-actions').removeClass('d-none');

                            $('#article-edit-btn').off('click').on('click', async function () {
                                const newTitle = prompt('Editar título:', article.title);
                                if (newTitle === null) return;
                                const newContent = prompt('Editar contenido:', article.content);
                                if (newContent === null) return;

                                const t = newTitle.trim() || article.title;
                                const c = newContent.trim() || article.content;
                                if (updateLocalArticleById(articleId, { title: t, content: c })) {
                                    $('#article-title').text(t);
                                    $('#article-content').text(c);
                                    article.title = t;
                                    article.content = c;
                                    alert('Reseña actualizada correctamente.');
                                } else {
                                    alert('No se pudo actualizar la reseña.');
                                }
                            });

                            $('#article-delete-btn').off('click').on('click', async function () {
                                if (!confirm('¿Seguro que deseas eliminar esta reseña?')) return;
                                deleteLocalArticleById(articleId);
                                alert('Reseña eliminada.');
                                window.location.href = sitePage('article');
                            });
                        }
                    } else {
                        $('#article-title').text('Reseña no encontrada');
                        $('#article-author').text('By: Sistema');
                        $('#article-content').text('No se pudo cargar esta reseña.');
                        $('#article-like-btn').addClass('d-none');
                    }
                })
                .catch(e => console.error(e));
        } else {
            $detailView.addClass('d-none');
            $listView.removeClass('d-none');
            fetchArticlesCollection().then(renderReviewsList);
        }
    }

    // ===== Feed Último: reseñas recientes (misma fuente que el archivo) =====
    // El servidor sirve ultimo-bootstrap.html en /ultimo (pathname sin .html)
    const pathNorm = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    const isUltimoPage =
        pathNorm === '/ultimo' || /ultimo-bootstrap\.html/i.test(window.location.pathname);
    if (isUltimoPage) {
        const $ultimoFeed = $('#ultimo-feed');
        if ($ultimoFeed.length) {
            fetchArticlesCollection()
                .then(articles => {
                    const sorted = [...articles].sort((a, b) => getArticleSortTime(b) - getArticleSortTime(a));
                    $ultimoFeed.empty();
                    if (!sorted.length) {
                        $ultimoFeed.html(
                            '<div class="sakura-card p-4"><p class="mb-0 text-muted-admin">Aún no hay reseñas publicadas. Cuando publiques desde Escribir, aparecerán aquí.</p></div>'
                        );
                        return;
                    }
                    sorted.forEach((article, index) => {
                        const articleKey = article.id ?? article._id;
                        if (articleKey == null) return;
                        const theme = ULTIMO_FEED_ROW_THEMES[index % ULTIMO_FEED_ROW_THEMES.length];
                        const href = `${sitePage('article')}?id=${encodeURIComponent(articleKey)}`;
                        const when = formatRelativeTimeEs(getArticleSortTime(article));
                        const entryTag = `ENTRY_${String(articleKey).padStart(3, '0')}`;
                        const $row = $(`
                            <div class="ab-log-row ab-log-row--ultimo border-start border-4" style="border-color:${theme.border} !important;" role="button" tabindex="0">
                                <p class="ab-ultimo-title text-white">${escapeHtml(article.title || 'Sin título')}</p>
                                <p class="text-muted-admin ab-ultimo-snippet">${escapeHtml((article.content || '').slice(0, 130))}${(article.content || '').length > 130 ? '…' : ''}</p>
                                <small class="font-headline text-uppercase sakura-muted d-block ab-ultimo-meta">${escapeHtml(entryTag)} · ${escapeHtml(when)} · ${escapeHtml(article.category || 'Reseña')} · ${escapeHtml(article.author || 'Autor')}</small>
                            </div>
                        `);
                        $row.on('click', function () {
                            sessionStorage.setItem('selectedArticleForRead', JSON.stringify(article));
                            window.location.href = href;
                        });
                        $row.on('keydown', function (e) {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                $(this).trigger('click');
                            }
                        });
                        $ultimoFeed.append($row);
                    });
                })
                .catch(e => {
                    console.error(e);
                    $ultimoFeed.html(
                        '<div class="sakura-card p-4"><p class="mb-0 text-muted-admin">No se pudo cargar el feed. Revisa la conexión o el servidor.</p></div>'
                    );
                });
        }
    }
});
