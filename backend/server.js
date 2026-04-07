require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const articlesRoutes = require('./routes/articles.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/users', usersRoutes);

// Servir estáticos limpios individuales
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/img', express.static(path.join(__dirname, '../img')));

const fs = require('fs');

// Redirigir el root a rutas limpias (interactúa como un "pretty urls" rewrite)
app.use((req, res, next) => {
    // Evitar interceptar API
    if (req.path.startsWith('/api')) return next();

    // Limpiar URLs sucias por redirects antiguos
    if (req.path.includes('/html/') || req.path.endsWith('.html')) {
        let cleanPath = req.path.replace(/\/html\//g, '/').replace('-bootstrap.html', '').replace('.html', '');
        if (cleanPath === '' || cleanPath === '/index') cleanPath = '/';
        return res.redirect(cleanPath);
    }
    
    let page = req.path.split('/')[1] || 'index';
    if (page === '') page = 'index';
    
    let expectedFile = path.join(__dirname, `../html/${page}-bootstrap.html`);
    
    // Si la vista solicitada existe, enviar el archivo nativo al explorador
    if (fs.existsSync(expectedFile)) {
        return res.sendFile(expectedFile);
    }
    
    next();
});

// Fallback error middlewares
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API Route Not Found' });
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '../html/error-404.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, '../html/error-500.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
