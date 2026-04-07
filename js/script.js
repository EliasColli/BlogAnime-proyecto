// Funcionalidad Principal: AniVibe / SECURE_ACCESS adaptado a Backend Node.js
const API_URL = 'http://localhost:3000/api';

// Sobrescritura de Alertas Nativas con Modal Premium
window.alert = function(msg) {
    $('#customAlertModal').remove();
    const modalHtml = `
    <div class="modal fade" id="customAlertModal" tabindex="-1" aria-hidden="true" style="backdrop-filter: blur(5px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-white" style="background:linear-gradient(145deg, #130e24, #0a0614); border: 1px solid rgba(255,100,150,0.3); border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.6);">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" style="letter-spacing:0.15em; color:var(--primary); font-family:'Space Grotesk', sans-serif;">// SYS_MSG</h5>
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

/** Nombre lógico -> archivo virtual limpio */
function sitePage(stem) {
    if (stem === 'admin') return '/';
    if (stem === 'index') return '/';
    return '/' + stem;
}

$(document).ready(function () {
    console.log("Sistema Iniciado: AniVibe / SECURE_ACCESS conectado a Backend");

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
                    setTimeout(() => window.location.reload(), 1500);
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
            try {
                const res = await fetch(`${API_URL}/articles/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    alert("Proyecto eliminado.");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    const error = await res.json();
                    alert(error.message || "Error eliminando artículo.");
                }
            } catch (e) {
                console.error(e);
            }
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
                    window.location.href = sitePage('index');
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
    const $recoverForm = $('#recoverForm');
    if ($recoverForm.length) {
        $recoverForm.on('submit', function (e) {
            e.preventDefault();
            alert('Aún no implementado en el backend real.');
        });
    }

    // ===== Lógica GLOBAL para Auth y Perfil en Navbar =====
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const $authSection = $('#auth-section');

    if (currentUser && $authSection.length) {
        function escHtml(s) {
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/"/g, '&quot;');
        }
        if (usingBootstrapPages()) {
            const roleExtra = currentUser.role === 'ADMIN'
                ? `<li><a class="dropdown-item" href="${sitePage('index')}">Portada</a></li>`
                : `<li><a class="dropdown-item" href="${sitePage('panel_escritor')}">Escribir reseña</a></li>`;
            $authSection.html(`
                <div class="dropdown ms-md-3 mt-3 mt-md-0">
                    <button type="button" class="btn btn-sm btn-outline-light dropdown-toggle text-uppercase fw-bold" style="letter-spacing:0.14em;font-size:11px;" data-bs-toggle="dropdown" aria-expanded="false">${escHtml(currentUser.name)}</button>
                    <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                        <li><h6 class="dropdown-header">${escHtml(currentUser.role)}</h6></li>
                        <li><a class="dropdown-item" href="${sitePage('ajustes')}">Ajustes</a></li>
                        ${roleExtra}
                        <li><hr class="dropdown-divider"></li>
                        <li><button type="button" class="dropdown-item text-danger" id="logoutBtn">Cerrar sesión</button></li>
                    </ul>
                </div>`);
        } else {
            $authSection.html(`
            <div class="relative group cursor-pointer flex items-center gap-2 pr-2">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVNDh2HpSgo0gY5JHH45wt3mKcDNOxhu2Eu3QMhFWDOJOX1eN-YpsUl4-WazVYPSs0K3yxK-ImjkJ0xsHKHH2QTFAtnHk-txU9d_b-fWzsBBIWJ42fR-VLci6VI1joNRdHLQurNckya2-4SrxdF9TyBrduyRpYb8Ak3X2bXc3vHqKqMVYNXCAjw-FRkAWML2OYT17mx45Ab9BtxNZmKcY9Fb-R06juLFRka8qy48t16k2gxwNv51mMoSVAvjB9CvG8DtV4cA49brjk" class="w-10 h-10 rounded-full border-2 border-primary object-cover" alt="Perfil" />
                <span class="material-symbols-outlined text-sm text-white group-hover:text-primary transition-all duration-300" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
                
                <div class="absolute right-0 top-full mt-2 hidden group-hover:block w-48 bg-surface-container-highest rounded shadow-xl overflow-hidden z-50 border border-white/10">
                    <div class="px-4 py-3 border-b border-white/10">
                        <p class="text-xs font-bold text-white font-headline">${currentUser.name}</p>
                        <p class="text-[10px] text-primary tracking-widest font-headline">${currentUser.role}</p>
                    </div>
                    <a href="${sitePage('ajustes')}" class="flex items-center gap-2 px-4 py-3 text-xs font-headline uppercase tracking-widest text-slate-300 hover:bg-surface-container hover:text-white"><span class="material-symbols-outlined text-sm">settings</span> Ajustes</a>
                    ${currentUser.role === 'ADMIN' ? `<a href="${sitePage('admin')}" class="flex items-center gap-2 px-4 py-3 text-xs font-headline uppercase tracking-widest text-white hover:bg-surface-container"><span class="material-symbols-outlined text-sm">admin_panel_settings</span> Admin Dashboard</a>` : `<a href="${sitePage('panel_escritor')}" class="flex items-center gap-2 px-4 py-3 text-xs font-headline uppercase tracking-widest text-primary hover:bg-surface-container"><span class="material-symbols-outlined text-sm">edit_document</span> Escribir Reseña</a>`}
                    <button id="logoutBtn" class="w-full text-left flex items-center gap-2 px-4 py-3 text-xs font-headline uppercase tracking-widest text-error hover:bg-surface-container"><span class="material-symbols-outlined text-sm">logout</span> Cerrar Sesión</button>
                </div>
            </div>
        `);
        }

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
                    const dbRes = await fetch(`${API_URL}/articles`, { credentials: 'include' });
                    let dbArticles = [];
                    if (dbRes.ok) {
                        dbArticles = await dbRes.json();
                    }

                    let displayArticles = [...dbArticles];

                    // Llamada a API externa como fallback (AnimeAPIPlatform) si aplicaba
                    if (!currentUser || currentUser.role !== 'USER') {
                        try {
                            const premiumRes = await fetch('https://www.animeapiplatform.com/api/v1/anime', {
                                headers: {
                                    'Authorization': 'Bearer sk-8deebbe3cf4bb33e429149b8999f287c6e99fc3be63f35d4'
                                }
                            });
                            const apiData = await premiumRes.json();
                            const topAnimes = apiData.data ? apiData.data.slice(0, 6) : [];
                            const apiReviews = topAnimes.map(anime => {
                                const tags = anime.tags ? anime.tags.slice(0,3).join(', ') : 'Sin tags';
                                return {
                                    id: anime.id * 1000, // Make ID distinct to avoid clash
                                    title: anime.title,
                                    author: "AnimeAPIPlatform",
                                    category: anime.type || "Tendencia",
                                    content: `Status: ${anime.status}. Etiquetas detectadas: ${tags}.`,
                                    image: anime.picture || "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1080&auto=format&fit=crop"
                                };
                            });
                            displayArticles = [...displayArticles, ...apiReviews];
                        } catch (e) {
                            console.warn('API fallback failed');
                        }
                    } else {
                        displayArticles = displayArticles.filter(a => a.author === currentUser.name);
                        const $title = $('.lg\\:col-span-8 > div > h3');
                        if ($title.length) $title.text("My Projects / Tasks");
                    }

                    $articlesGrid.empty();

                    if (displayArticles.length > 0) {
                        displayArticles.forEach(article => {
                            const isOwnOrAdmin = (currentUser && (currentUser.role === 'ADMIN' || article.author === currentUser.name));
                            const originIsDB = article.id < 1000000; // Fake way to not delete API platform articles easily
                            const deleteBtn = (isOwnOrAdmin && originIsDB) ? `<button onclick="event.stopPropagation(); deleteArticle(${article.id})" class="absolute top-4 right-4 bg-error text-white font-bold p-2 rounded-full hover:scale-110 transition-transform z-20"><span class="material-symbols-outlined text-sm">delete</span></button>` : '';
                            
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
                } catch(e) {
                    console.error("Error fetching articles", e);
                }
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

    // ===== Lógica de Write Article =====
    const $writeArticleForm = $('#writeArticleForm');
    if ($writeArticleForm.length) {
        if (!currentUser) {
            alert('Debes iniciar sesión para publicar un artículo.');
            window.location.href = sitePage('login');
        }

        $writeArticleForm.on('submit', async function (e) {
            e.preventDefault();
            const title = $('#title').val();
            const category = $('#category').val() || 'Sin Categoría';
            const content = $('#content').val();
            // Try to extract image URL if available
            const image = $('#image').length ? $('#image').val() : '';

            const $btn = $writeArticleForm.find('button');
            const originalHTML = $btn.html();

            $btn.prop('disabled', true).text('Publicando...');

            try {
                const res = await fetch(`${API_URL}/articles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ title, category, content, image })
                });

                if (res.ok) {
                    alert('Proyecto publicado exitosamente.');
                    window.location.href = sitePage('index');
                } else {
                    const error = await res.json();
                    alert(error.message || 'Error al publicar');
                    $btn.prop('disabled', false).html(originalHTML);
                }
            } catch (err) {
                alert("Error de conexión");
                $btn.prop('disabled', false).html(originalHTML);
            }
        });
    }

    // ===== Lógica Viewing Article =====
    const isArticleView = /\/article(\?|$)/i.test(window.location.pathname) || /\/article-bootstrap\.html(\?|$)/i.test(window.location.pathname);
    if (isArticleView) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        if (articleId) {
            fetch(`${API_URL}/articles/${articleId}`)
                .then(res => res.json())
                .then(article => {
                    if (article && !article.message) {
                        $('#article-title').text(article.title);
                        $('#article-author').text("By: " + article.author);
                        $('#article-content').text(article.content);
                        if (article.image) {
                            $('.article-cover').attr('src', article.image);
                        }
                    }
                })
                .catch(e => console.error(e));
        } else {
            // Vista de Catálogo Completo
            $('#single-article-view').hide();
            $('#catalog-article-view').show();
            
            fetch(`${API_URL}/articles`, { credentials: 'include' })
                .then(res => res.json())
                .then(articles => {
                    const catalogGrid = $('#catalog-grid');
                    catalogGrid.empty();
                    
                    if (articles.length === 0) {
                        catalogGrid.html('<p class="text-tertiary font-headline tracking-widest uppercase text-sm">EL CATÁLOGO ESTÁ VACÍO.</p>');
                        return;
                    }

                    articles.forEach(article => {
                         const trunc = article.content.length > 200 ? article.content.substring(0, 200) + '...' : article.content;
                         const card = `
                         <div class="col-12 col-md-4 col-lg-3">
                             <article class="group cursor-pointer bg-surface border border-secondary p-4 h-100 d-flex flex-column" style="background:#130e24;" onclick="window.location.href='${sitePage('article')}?id=${article.id}'">
                                 <h4 class="text-white text-uppercase fw-bold mb-3" style="font-size:16px; letter-spacing:0.05em; font-family:'Space Grotesk', sans-serif;">${article.title}</h4>
                                 <div class="d-flex justify-content-between align-items-center mb-3">
                                     <p class="text-primary text-uppercase m-0" style="font-size: 10px; letter-spacing: 0.1em;">AUTOR // ${article.author}</p>
                                     <span class="px-2 py-1 text-white text-uppercase m-0" style="font-size: 9px; background:var(--accent);">${article.category || 'RESEÑA'}</span>
                                 </div>
                                 <p class="text-muted m-0 flex-grow-1" style="font-size:13px; line-height:1.6;">${trunc}</p>
                             </article>
                         </div>`;
                         catalogGrid.append(card);
                    });
                })
                .catch(e => {
                    console.error("Error cargando catálogo", e);
                    $('#catalog-grid').html('<p class="text-danger font-headline uppercase text-sm">ERROR DE CONEXIÓN CON LA MATRIZ.</p>');
                });
        }
    }
});
