import http from 'http';

async function checkFrontendServer() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5173', (res) => {
      console.log(`Frontend Vite Server HTTP Status: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('<div id="root"></div>')) {
          console.log('SUCCESS! React HTML entry point is serving correctly at http://localhost:5173');
          resolve(true);
        } else {
          console.log('HTML content loaded');
          resolve(true);
        }
      });
    }).on('error', (err) => {
      console.error('Frontend server check error:', err.message);
      reject(err);
    });
  });
}

checkFrontendServer();
