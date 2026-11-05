const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
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
    '.ttf': 'font/ttf',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
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
    // Handle POST submissions (local dev simulation for Netlify Forms)
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ status: 'success', message: 'Netlify form submission received' }));
        });
        return;
    }

    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Standard and legacy browser icon requests
    if (urlPath === '/favicon.ico') {
        const icoPath = path.resolve(__dirname, 'favicon.ico');
        if (fs.existsSync(icoPath)) {
            res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' });
            fs.createReadStream(icoPath).pipe(res);
            return;
        }
    }
    if (urlPath === '/apple-touch-icon.png') {
        const appleIconPath = path.resolve(__dirname, 'apple-touch-icon.png');
        if (fs.existsSync(appleIconPath)) {
            res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' });
            fs.createReadStream(appleIconPath).pipe(res);
            return;
        }
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
