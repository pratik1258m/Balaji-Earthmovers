const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

function serve404(req, res) {
    const isHtml = (req.headers.accept && req.headers.accept.includes('text/html')) || !path.extname(req.url);
    const page404 = path.resolve(__dirname, '404.html');

    if (isHtml && fs.existsSync(page404)) {
        fs.readFile(page404, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
    }
}

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Forward any legacy browser favicon request (/favicon.ico, /apple-touch-icon.png, /favicon.png)
    // directly to images/logo-tile.webp with cache-busting headers to purge stale browser caches.
    if (urlPath === '/favicon.ico' || urlPath === '/apple-touch-icon.png' || urlPath === '/favicon.png') {
        const logoTilePath = path.resolve(__dirname, 'images', 'logo-tile.webp');
        fs.readFile(logoTilePath, (err, content) => {
            if (err) {
                serve404(req, res);
            } else {
                res.writeHead(200, {
                    'Content-Type': 'image/webp',
                    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(content);
            }
        });
        return;
    }

    let rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    if (rel === '404') rel = '404.html';
    const filePath = path.resolve(__dirname, rel);

    // Only files inside this project, and only the public asset types. The
    // source brochure (GSTIN, PAN, proprietor photo) must never be served.
    const denied = !filePath.startsWith(__dirname + path.sep)
        || path.basename(filePath).startsWith('.')
        || !(path.extname(filePath).toLowerCase() in MIME_TYPES);

    if (denied) {
        serve404(req, res);
        return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()];

    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                serve404(req, res);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }

        if (!stats.isFile()) {
            serve404(req, res);
            return;
        }

        const range = req.headers.range;

        // Support HTTP 206 Partial Content for video/audio streaming and seek performance
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

            if (isNaN(start) || start >= stats.size || (parts[1] && isNaN(end)) || start > end) {
                res.writeHead(416, {
                    'Content-Range': `bytes */${stats.size}`,
                    'Content-Type': contentType
                });
                return res.end();
            }

            const chunkSize = (end - start) + 1;
            const stream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400'
            });

            stream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': stats.size,
                'Accept-Ranges': 'bytes',
                'Content-Type': contentType,
                'Cache-Control': contentType.startsWith('video/') || contentType.startsWith('image/')
                    ? 'public, max-age=86400'
                    : 'no-cache'
            });

            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
