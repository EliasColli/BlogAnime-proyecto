/**
 * SAKURA_ADMIN_CORE: Full Hybrid Implementation (Backend + Mock Resilience)
 */
if (typeof API_URL === 'undefined') {
    window.API_URL = 'http://localhost:3000/api';
}

$(document).ready(function () {
    console.log("SakuraAdmin Core: Operational with Resilience Logic.");

    // --- 1. Navigation Flow ---
    const navMap = {
        'dashboard-link': '#view-dashboard',
        'articles-link': '#view-articles',
        'comments-link': '#view-comments',
        'gallery-link': '#view-gallery',
        'users-link': '#view-users',
        'analytics-link': '#view-analytics',
        'settings-link': '#view-settings',
        'database-link': '#view-database',
        'security-link': '#view-security',
        'reports-link': '#view-reports'
    };

    const $adminNavLinks = $('nav a[id$="-link"]');

    $adminNavLinks.on('click', function (e) {
        e.preventDefault();
        const id = $(this).attr('id');
        const targetView = navMap[id];

        $adminNavLinks.removeClass('active-tab opacity-100').addClass('opacity-50 hover:opacity-100');
        $(this).addClass('active-tab opacity-100').removeClass('opacity-50 hover:opacity-100');

        $('main > div').hide();
        $(targetView).fadeIn(300);

        // API Data Fetching based on tab (With Fallback)
        if (id === 'articles-link') renderArticlesTable();
        if (id === 'users-link') renderUsersTable();
        if (id === 'comments-link') renderCommentsTable();
        if (id === 'gallery-link') renderGalleryGrid();
        if (id === 'reports-link') renderReportsGrid();
        if (id === 'database-link') renderDatabaseView();
        if (id === 'security-link') renderSecurityView();
    });

    // --- 2. Content Management (Articles) ---
    window.openNewArticleModal = () => $('#modal-article').removeClass('hidden').css('display', 'flex');
    window.closeArticleModal = () => $('#modal-article').addClass('hidden').hide();

    window.renderArticlesTable = async function() {
        let articles = [];
        try {
            articles = JSON.parse(localStorage.getItem('articles')) || [];
        } catch (e) {
            articles = [];
        }

        const $tbody = $('#articles-table tbody');
        if($tbody.length) {
            $tbody.empty();
            articles.forEach(a => {
                $tbody.append(`
                    <tr>
                        <td>
                            <p class="mb-1 fw-bold text-white text-uppercase">${a.title}</p>
                            <p class="mb-0 text-uppercase font-headline text-muted" style="font-size: 10px; letter-spacing: .08em;">Autor: @${a.author || 'Admin'} · ${a.category || 'Reseña'}</p>
                        </td>
                        <td class="text-end">
                             <button onclick="deleteArticle(${a.id})" class="btn btn-sm text-danger border border-danger border-opacity-25">
                                <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
                             </button>
                        </td>
                    </tr>
                `);
            });
        }
        $('#kpi-articles-count').text(articles.length);
    };

    // --- 3. Community (Comments) ---
    window.renderCommentsTable = async function() {
        let comments = [];
        try {
            const res = await fetch(`${API_URL}/comments`, { credentials: 'include' });
            if (res.ok) comments = await res.json();
            else throw new Error();
        } catch(e) {
            comments = JSON.parse(localStorage.getItem('comments')) || [];
        }

        const $tbody = $('#comments-table tbody');
        if($tbody.length) {
            $tbody.empty();
            comments.forEach(c => {
                $tbody.append(`
                    <tr>
                        <td class="text-white">
                            <p class="mb-1 fw-bold">@${c.user}</p>
                            <p class="mb-0 text-muted-admin fst-italic" style="font-size: 12px;">"${c.text}"</p>
                        </td>
                        <td class="text-center">
                            <span class="badge ${c.status === 'SPAM' ? 'text-bg-danger' : 'text-bg-success'}">${c.status}</span>
                        </td>
                        <td class="text-end">
                             <button onclick="moderateComment(${c.id}, 'delete')" class="btn btn-sm text-danger border border-danger border-opacity-25">
                                <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
                             </button>
                        </td>
                    </tr>
                `);
            });
        }
        $('#kpi-comments-count').text(comments.length);
    };

    window.moderateComment = async function(id, action) {
        if(action === 'delete') {
            if(!confirm("¿Deseas eliminar este mensaje permanentemente?")) return;
            try {
                const res = await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE', credentials: 'include' });
                if(res.ok) {
                    alert("Mensaje purgado del Nexo.");
                    renderCommentsTable();
                } else {
                    // Fallback delete for local storage
                    let localComments = JSON.parse(localStorage.getItem('comments')) || [];
                    localComments = localComments.filter(com => com.id != id);
                    localStorage.setItem('comments', JSON.stringify(localComments));
                    renderCommentsTable();
                }
            } catch(e) {
                alert("Eliminación local completada.");
                let localComments = JSON.parse(localStorage.getItem('comments')) || [];
                localComments = localComments.filter(com => com.id != id);
                localStorage.setItem('comments', JSON.stringify(localComments));
                renderCommentsTable();
            }
        }
    };

    // --- 4. Users ---
    window.renderUsersTable = async function() {
        let users = [];
        try {
            const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
            if (res.ok) users = await res.json();
            else throw new Error();
        } catch(e) {
            users = JSON.parse(localStorage.getItem('users')) || [];
        }

        const $tbody = $('#users-table tbody');
        if($tbody.length) {
            $tbody.empty();
            users.forEach(u => {
                $tbody.append(`
                    <tr>
                        <td class="text-white">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width:40px; height:40px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.06); color: var(--accent);">${u.name[0]}</div>
                                <p class="mb-0 fw-bold text-uppercase">${u.name}</p>
                            </div>
                        </td>
                        <td><span class="badge ${u.role==='ADMIN' ? 'text-bg-primary' : 'text-bg-secondary'}">${u.role}</span></td>
                        <td class="text-end">
                             <button onclick="resetUserPassword('${u.email}')" class="btn btn-sm text-info border border-info border-opacity-25 me-1" title="Reset Password">
                                <span class="material-symbols-outlined" style="font-size:18px;">lock_reset</span>
                             </button>
                             <button onclick="deleteUser('${u.email}')" class="btn btn-sm text-danger border border-danger border-opacity-25" title="Delete User">
                                <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
                             </button>
                        </td>
                    </tr>
                `);
            });
        }
        $('#kpi-users-count').text(users.length);
    };
    window.resetUserPassword = async function(email) {
        if(!confirm(`¿Deseas restablecer la contraseña de ${email} al valor por defecto (123456)?`)) return;
        try {
            const res = await fetch(`${API_URL}/users/reset/${email}`, { method: 'PUT', credentials: 'include' });
            if(res.ok) alert("Contraseña restablecida a: 123456");
            else alert("Error al restablecer contraseña.");
        } catch(e) {
            alert("Acción no disponible en modo local.");
        }
    };

    // --- 5. Assets (Gallery) ---
    function renderGalleryGrid() {
        const $grid = $('#gallery-grid');
        if(!$grid.length) return;
        $grid.empty();
        const localImages = [
            'Assassination Classroom.jpg', 'Dr Stone.jpg', "FRIEREN BEYOND JOURNEY'S END.jpg",
            'Tamon-kun Ima Docchi.jpg', 'Uruwashi no Yoi no Tsuki.jpg', 'a silent voice.jpg',
            'el castillo ambulante.jpg', 'jujutsu kaisen 3.jpg', 'oshi no ko.jpg',
            'portada.jpg', 'img_archive_1.png', 'img_archive_2.png', 'img_archive_3.png'
        ];
        localImages.forEach((img, i) => {
            $grid.append(`
                <div class="col">
                    <div class="sakura-card h-100 p-2 animate-view" style="animation-delay:${i * 50}ms;">
                        <img src="../img/${img}" class="w-100 rounded-3 object-fit-cover mb-2" style="aspect-ratio:1/1;">
                        <p class="mb-1 text-uppercase text-center font-headline" style="font-size:9px; letter-spacing:.08em; color: var(--accent);">${img}</p>
                    </div>
                </div>
            `);
        });
    }

    // --- 6. Security, Database, Reports (UI Only) ---
    window.renderReportsGrid = () => {
        $('#view-reports').html(`
            <header class="mb-4">
                <h2 class="section-title display-6 mb-0">Feedback y Reportes</h2>
                <p class="text-uppercase mb-0 mt-2" style="font-size: 10px; letter-spacing: .14em; color: var(--accent-hot);">Incidencias activas</p>
            </header>
            <div class="row g-3">
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="sakura-card p-4 h-100">
                        <span class="badge text-bg-danger mb-3">Bug report</span>
                        <p class="mb-0 text-white small">No se puede subir imágenes en Firefox en reseñas largas.</p>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="sakura-card p-4 h-100">
                        <span class="badge text-bg-warning mb-3">Moderación</span>
                        <p class="mb-0 text-white small">Aumento de spoilers sin etiqueta en comentarios de temporada.</p>
                    </div>
                </div>
            </div>
        `);
    };

    window.renderDatabaseView = () => {
        $('#view-database').html(`
            <header class="mb-4"><h2 class="section-title display-6 mb-0">Cerebro de Datos</h2></header>
            <div class="sakura-card p-4 p-lg-5 text-center">
                 <p class="text-uppercase mb-3 text-muted-admin" style="font-size: 11px; letter-spacing: .12em;">Conectado a la base de datos principal</p>
                 <button class="btn text-uppercase fw-bold font-headline" style="letter-spacing:.12em; background: var(--accent); color: var(--bg);">Generar Backup Full JSON</button>
            </div>
        `);
    };

    window.renderSecurityView = () => {
        $('#view-security').html(`
            <header class="mb-4"><h2 class="section-title display-6 mb-0">Master Security Vault</h2></header>
            <div class="sakura-card p-4 p-lg-5">
                <h4 class="text-uppercase mb-4" style="font-size: 11px; letter-spacing: .14em; color: var(--accent-hot);">Protección de lenguaje ofensivo</h4>
                <div class="d-flex justify-content-between align-items-center p-3 rounded-3 border border-light border-opacity-10" style="background: rgba(0,0,0,.2);">
                    <p class="mb-0 text-white small">@GamerToxic (SPAM)</p>
                    <button class="btn btn-sm text-uppercase fw-bold font-headline" style="font-size: 10px; letter-spacing: .1em; color: var(--accent); border: 1px solid rgba(45,212,191,.35);">Indultar</button>
                </div>
            </div>
        `);
    };

    // --- Initial Load ---
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(user) $('#admin-name').text(user.name.toUpperCase());

    $('#admin-logout').on('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index-bootstrap.html';
    });

    // Default Load
    renderArticlesTable();
    renderUsersTable();
    renderCommentsTable();
});
