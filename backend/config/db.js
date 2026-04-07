const mysql = require('mysql2/promise');
require('dotenv').config();

let activePool = null;

const localConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'blog_anime',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const cloudConfig = {
    host: 'biuumuhqw21efiz8c1dr-mysql.services.clever-cloud.com',
    user: 'ukwhd6gzpkdwjtvm',
    password: '5TKeszj7gGUqdHJdsy8i',
    database: 'biuumuhqw21efiz8c1dr',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function initPool() {
    try {
        const tempLocal = mysql.createPool(localConfig);
        await tempLocal.query('SELECT 1');
        console.log('✅ Connected to LOCAL MySQL Database.');
        activePool = tempLocal;
    } catch (error) {
        console.warn('⚠️ Local database not available. Failing over to CLOUD Database...');
        try {
            const tempCloud = mysql.createPool(cloudConfig);
            await tempCloud.query('SELECT 1');
            console.log('☁️ Connected to CLOUD MySQL Database.');
            activePool = tempCloud;
        } catch (cloudErr) {
            console.error('❌ BOTH Local and Cloud databases failed to connect!');
            activePool = mysql.createPool(localConfig); 
        }
    }
}

// Iniciar chequeo en fondo
initPool();

const poolProxy = {
    query: async (...args) => {
        // Esperar unos ms si el pool aún no se ha resuelto
        while (!activePool) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return activePool.query(...args);
    }
};

module.exports = poolProxy;
