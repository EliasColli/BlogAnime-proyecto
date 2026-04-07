// Funcionalidad Principal: AniVibe / SECURE_ACCESS (Convertido a jQuery según requerimientos)

/** El sitio usa solo páginas *-bootstrap.html (variantes .html legacy eliminadas). */
function usingBootstrapPages() {
    return true;
}

/** Nombre lógico -> archivo en /html (ej. 'login' -> login-bootstrap.html). */
function sitePage(stem) {
    if (stem === 'admin') return 'index-bootstrap.html';
    return stem + '-bootstrap.html';
}

$(document).ready(function () {
    console.log("Sistema Iniciado: AniVibe / SECURE_ACCESS");

    // Initialize mock database in localStorage
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            { id: 1, name: 'Admin', email: 'admin@curator.com', password: 'admin', role: 'ADMIN' },
            { id: 2, name: 'Normal User', email: 'user@curator.com', password: 'user', role: 'USER' }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }

    if (!localStorage.getItem('articles')) {
        const initialArticles = [
            { id: 1, title: 'The Visual Mastery of Studio Ghibli', content: 'A deep dive into the color theory and animation techniques that make these films legendary in the anime community. Using soft palettes and organic movement, they redefined the landscape...', author: 'Admin', date: new Date().toISOString() },
            { id: 2, title: 'Cyberpunk Edgerunners & Urban Aesthetic', content: 'Analyzing how Studio Trigger adapted Night City and utilized neon palettes to evoke emotion. The rapid-fire editing matches the pacing of the game perfectly...', author: 'Normal User', date: new Date().toISOString() }
        ];
        localStorage.setItem('articles', JSON.stringify(initialArticles));
    }

    // Funciones globales para botones dinámicos
    window.deleteUser = function (email) {
        if (confirm("¿Seguro que deseas eliminar este usuario?")) {
            let users = JSON.parse(localStorage.getItem('users'));
            users = users.filter(u => u.email !== email);
            localStorage.setItem('users', JSON.stringify(users));
            alert("Usuario eliminado.");
            window.location.reload();
        }
    };

    window.changeRole = function (email) {
        let users = JSON.parse(localStorage.getItem('users'));
        let user = users.find(u => u.email === email);
        if (user) {
            user.role = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
            localStorage.setItem('users', JSON.stringify(users));
            alert("Rol actualizado a " + user.role);
            window.location.reload();
        }
    };

    window.deleteArticle = function (id) {
        if (confirm("¿Seguro que deseas eliminar este proyecto/artículo?")) {
            let articles = JSON.parse(localStorage.getItem('articles'));
            articles = articles.filter(a => a.id !== id);
            localStorage.setItem('articles', JSON.stringify(articles));
            alert("Proyecto eliminado.");
            window.location.reload();
        }
    };

    // ===== Lógica de Login (SECURE_ACCESS) =====
    const $loginForm = $('#loginForm');
    if ($loginForm.length) {
        $loginForm.on('submit', function (e) {
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

            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users'));
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));

                    window.location.href = sitePage('index');
                } else {
                    alert('CREDENCIALES INVÁLIDAS. ACCESO DENEGADO.');
                    $btnContent.html(originalHTML);
                    $btn.prop('disabled', false);
                    $btn.removeClass('opacity-80 cursor-not-allowed');
                }
            }, 1000);
        });
    }

    // ===== Lógica de Registro =====
    const $registerForm = $('#registerForm');
    if ($registerForm.length) {
        $registerForm.on('submit', function (e) {
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

            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users'));

                if (users.find(u => u.email === email)) {
                    alert("El usuario ya existe.");
                    $btnContent.html(originalHTML);
                    $btn.prop('disabled', false);
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    name: fullname,
                    email: email,
                    password: password,
                    role: 'USER' // Por defecto es USER
                };

                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                alert('Registro exitoso. Serás redirigido al login.');
                window.location.href = sitePage('login');
            }, 1000);
        });
    }

    // ===== Lógica de Recuperación de Contraseña =====
    const $recoverForm = $('#recoverForm');
    if ($recoverForm.length) {
        $recoverForm.on('submit', function (e) {
            e.preventDefault();
            const email = $('#email').val();

            const $btn = $recoverForm.find('button');
            const originalHTML = $btn.html();

            $btn.prop('disabled', true).text('Enviando...');

            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users'));
                const user = users.find(u => u.email === email);
                if (user) {
                    alert('Se ha enviado un token de recuperación a tu correo electrónico.');
                    // Simular que el usuario restablece su contraseña haciendo login temporal o guiándolo a reset-password
                    localStorage.setItem('recoveryEmail', email);
                    window.location.href = sitePage('login');
                } else {
                    alert('No se encontró ninguna cuenta con ese correo.');
                    $btn.html(originalHTML).prop('disabled', false);
                }
            }, 1000);
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

        $('#logoutBtn').on('click', function () {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });

        // Ocultar botón de suscripción si el usuario ya está registrado/logueado
        $('button:contains("SUSCRÍBETE_AHORA")').parent().hide();
        $('aside a[href*="register"]').closest('div.mt-auto, div.px-3').hide();
    }

    // ===== Lógica para el Navbar Público (Index) =====
    const isIndex = /\/index-bootstrap\.html(\?|$)/i.test(window.location.pathname) || window.location.pathname.endsWith('/');
    if (isIndex) {

        // Cargar artículos creados por la comunidad dinámicamente
        const $articlesGrid = $('.lg\\:col-span-8 .grid.grid-cols-1.md\\:grid-cols-2.gap-12');
        if ($articlesGrid.length) {
            let articles = JSON.parse(localStorage.getItem('articles')) || [];

            // Llamada a la API de AnimeAPIPlatform (y fallback open-source para garantizar que siempre funcione sin Key manual)
            async function loadReviews() {
                let displayArticles = [...articles];

                // Si NO es un USER normal mirando solo su panel personal, inyectamos reseñas mundiales "buenas" de la API
                if (!currentUser || currentUser.role !== 'USER') {
                    try {
                        const premiumRes = await fetch('https://www.animeapiplatform.com/api/v1/anime', {
                            headers: {
                                'Authorization': 'Bearer sk-8deebbe3cf4bb33e429149b8999f287c6e99fc3be63f35d4'
                            }
                        });
                        
                        const apiData = await premiumRes.json();
                        
                        // Map de la estructura real de AnimeAPIPlatform
                        // Tomamos los primeros 6 para que quepan bien en el layout
                        const topAnimes = apiData.data ? apiData.data.slice(0, 6) : [];
                        
                        const apiReviews = topAnimes.map(anime => {
                            const tags = anime.tags ? anime.tags.slice(0,3).join(', ') : 'Sin tags';
                            return {
                                id: anime.id,
                                title: anime.title,
                                author: "AnimeAPIPlatform",
                                category: anime.type || "Tendencia",
                                content: `Status: ${anime.status}. Etiquetas detectadas: ${tags}. Análisis y catálogo cargado directo desde la base de datos oficial.`,
                                image: anime.picture || "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1080&auto=format&fit=crop"
                            };
                        });

                        // Unir Base de Datos Local con la API
                        displayArticles = [...displayArticles, ...apiReviews];
                    } catch (e) {
                        console.warn('Error contactando https://www.animeapiplatform.com/ (O la API fallback):', e);
                    }
                } else {
                    // Si es un Estudiante, sólo mira sus propias reseñas que él haya escrito en local
                    displayArticles = displayArticles.filter(a => a.author === currentUser.name);
                    const $title = $('.lg\\:col-span-8 > div > h3');
                    if ($title.length) $title.text("My Projects / Tasks");
                }

                $articlesGrid.empty();

                if (displayArticles.length > 0) {
                    displayArticles.forEach(article => {
                        const isOwn = (currentUser && currentUser.role === 'USER' && article.author === currentUser.name);
                        const deleteBtn = isOwn ? `<button onclick="event.stopPropagation(); deleteArticle(${article.id})" class="absolute top-4 right-4 bg-error text-white font-bold p-2 rounded-full hover:scale-110 transition-transform z-20"><span class="material-symbols-outlined text-sm">delete</span></button>` : '';
                        
                        // Imagen por defecto neon, o la imagen real que vino de la API externa
                        const coverImg = article.image || "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1080&auto=format&fit=crop";

                        const articleHTML = `
                            <article class="space-y-6 group cursor-pointer relative bg-surface-container hover:bg-surface-container-high p-4 transition-colors" onclick="window.location.href='${sitePage('article')}?id=${article.id}'">
                                ${deleteBtn}
                                <div class="aspect-video overflow-hidden relative border border-outline-variant/30">
                                    <img src="${coverImg}" alt="${article.title}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-duration-700">
                                </div>
                                <h4 class="font-headline text-2xl font-bold text-white leading-tight uppercase truncate">${article.title}</h4>
                                <div class="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                                    <p class="text-[10px] font-headline tracking-widest text-primary uppercase">AUTOR // ${article.author}</p>
                                    <span class="bg-surface-container-highest px-2 py-1 text-[10px] text-tertiary font-bold tracking-widest uppercase">${article.category || 'RESEÑA'}</span>
                                </div>
                                <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-3">${article.content}</p>
                            </article>
                        `;
                        $articlesGrid.append(articleHTML);
                    });
                } else if (currentUser && currentUser.role === 'USER') {
                    $articlesGrid.html('<p class="text-tertiary font-headline tracking-widest uppercase text-sm">AÚN NO HAS ESCRITO NINGÚN DOCUMENTO DE ANÁLISIS.</p>');
                }
            }

            loadReviews(); // Ejecutar motor de carga asíncrona

        }

        // --- Nuevas Interacciones para index.html (INDEPENDIENTES DEL IDIOMA) ---

        // 1. Search Bar (Fltrado en tiempo real en la vista)
        const $searchInputs = $('nav input[type="text"]');
        $searchInputs.on('keyup', function () {
            const val = $(this).val().toLowerCase();
            $('.lg\\:col-span-8 article').each(function () {
                const title = $(this).find('h4').text().toLowerCase();
                $(this).toggle(title.indexOf(val) > -1);
            });
        });

        // 2. Newsletter Signup (Evitando depender de 'JOIN ELITE')
        const $joinBtn = $('aside .bg-surface-container-low input[type="email"]').siblings('button');
        if ($joinBtn.length) {
            $joinBtn.on('click', function (e) {
                e.preventDefault();
                const $input = $(this).siblings('input');
                const val = $input.val();
                if (val && val.includes('@')) {
                    alert('¡Suscripción exitosa con el correo: ' + val + '!');
                    $input.val('');
                } else {
                    alert('Acción requerida: Por favor, introduce un correo electrónico válido.');
                }
            });
        }

        // 3. Transform static Trending / Seasonal views into interactive cards
        $('aside .flex.gap-6, aside .relative.aspect-\\[4\\/5\\]').addClass('cursor-pointer hover:opacity-80 transition-opacity').on('click', function () {
            window.location.href = sitePage('article') + '?id=1';
        });

        // 4. Hero actions
        const $heroButtons = $('main > section:first-child button');
        if ($heroButtons.length >= 2) {
            $heroButtons.eq(0).on('click', function () {
                window.location.href = sitePage('article') + '?id=1';
            });
            $heroButtons.eq(1).on('click', function () {
                const $galleryTitle = $('section h2').last(); // Visual Archives
                if ($galleryTitle.length) {
                    $galleryTitle[0].scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // 5. Visual Archives click simulation
        $('section.py-24 div.relative.aspect-video, section.py-24 div.relative.aspect-square').addClass('cursor-pointer group').on('click', function () {
            alert('Esta acción abrirá la galería de imágenes extendida.');
        });

        // 6. Navbar anchor links simulated scrolling
        const $navLinks = $('nav .hidden.md\\:flex.gap-8 a');
        if ($navLinks.length >= 4) {
            $navLinks.eq(0).on('click', e => { e.preventDefault(); $('html,body').animate({ scrollTop: $('.lg\\:col-span-8').offset().top - 100 }, 'slow'); });
            $navLinks.eq(1).on('click', e => { e.preventDefault(); $('html,body').animate({ scrollTop: $('aside').offset().top - 100 }, 'slow'); });
            $navLinks.eq(2).on('click', e => {
                e.preventDefault();
                const $visArchive = $('section.py-24').first();
                if ($visArchive.length > 0) $('html,body').animate({ scrollTop: $visArchive.offset().top - 100 }, 'slow');
            });
            $navLinks.eq(3).on('click', e => { e.preventDefault(); $('html,body').animate({ scrollTop: $('footer').offset().top }, 'slow'); });
        }
    }

    // ===== Lógica de Write Article =====
    const $writeArticleForm = $('#writeArticleForm');
    if ($writeArticleForm.length) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Debes iniciar sesión para publicar un artículo.');
            window.location.href = sitePage('login');
        }

        $writeArticleForm.on('submit', function (e) {
            e.preventDefault();
            const title = $('#title').val();
            const category = $('#category').val() || 'Sin Categoría';
            const content = $('#content').val();

            const $btn = $writeArticleForm.find('button');
            const originalHTML = $btn.html();

            $btn.prop('disabled', true).text('Publicando...');

            setTimeout(() => {
                const articles = JSON.parse(localStorage.getItem('articles')) || [];
                articles.push({
                    id: Date.now(),
                    title: title,
                    category: category,
                    content: content,
                    author: currentUser.name,
                    date: new Date().toISOString()
                });
                localStorage.setItem('articles', JSON.stringify(articles));

                alert('Proyecto publicado exitosamente.');
                window.location.href = sitePage('index');
            }, 1000);
        });
    }

    // ===== Lógica Viewing Article =====
    const isArticleView = /\/article-bootstrap\.html(\?|$)/i.test(window.location.pathname);
    if (isArticleView) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        if (articleId) {
            const articles = JSON.parse(localStorage.getItem('articles')) || [];
            const article = articles.find(a => a.id == articleId);
            if (article) {
                $('#article-title').text(article.title);
                $('#article-author').text("By: " + article.author);
                $('#article-content').text(article.content);
            }
        }
    }

    $('#newsletter-submit').on('click', function (e) {
        e.preventDefault();
        const $inp = $('#newsletter-email');
        const val = ($inp.val() || '').trim();
        if (val && val.includes('@')) {
            alert('¡Suscripción exitosa con el correo: ' + val + '!');
            $inp.val('');
        } else {
            alert('Acción requerida: Por favor, introduce un correo electrónico válido.');
        }
    });

    if ($('#index-search-input').length) {
        $('#index-search-input').on('keyup', function () {
            const val = $(this).val().toLowerCase().trim();
            $('#contenido .row.g-4').each(function () {
                const txt = $(this).text().toLowerCase();
                $(this).toggle(!val || txt.indexOf(val) > -1);
            });
        });
    }
});
