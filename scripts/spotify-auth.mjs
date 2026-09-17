// One-time helper: gets a Spotify refresh token for the "now playing" widget.
//
//   1. Create an app at https://developer.spotify.com/dashboard
//   2. Add this Redirect URI to the app: http://127.0.0.1:8888/callback
//   3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env (or .env.local)
//   4. npm run spotify:auth, then open the printed link and approve
//   5. The refresh token is written into that env file for you
//      (also add all three values to your host's env settings when deploying).
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';

/** Writes KEY=value into the first env file that exists (.env.local wins, like Vite). */
function saveToEnvFile(key, value) {
  const file = ['.env.local', '.env'].find((f) => fs.existsSync(f)) ?? '.env.local';
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  const next = pattern.test(text) ? text.replace(pattern, line) : `${text.replace(/\n?$/, '\n')}${line}\n`;
  fs.writeFileSync(file, next);
  return file;
}

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const redirectUri = 'http://127.0.0.1:8888/callback';
const state = crypto.randomBytes(12).toString('hex');
const authUrl = new URL('https://accounts.spotify.com/authorize');
authUrl.search = new URLSearchParams({
  client_id: id,
  response_type: 'code',
  redirect_uri: redirectUri,
  scope: 'user-read-currently-playing user-read-recently-played',
  state,
}).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== '/callback') return res.writeHead(404).end();
  if (url.searchParams.get('state') !== state) return res.writeHead(400).end('State mismatch.');
  const code = url.searchParams.get('code');
  if (!code) return res.writeHead(400).end(`Authorization failed: ${url.searchParams.get('error')}`);

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  });
  const json = await tokenRes.json();
  if (!tokenRes.ok) {
    res.writeHead(500).end('Token exchange failed, see terminal.');
    console.error(json);
  } else {
    const file = saveToEnvFile('SPOTIFY_REFRESH_TOKEN', json.refresh_token);
    res.end('Done! Spotify is connected. You can close this tab.');
    console.log(`\nSaved SPOTIFY_REFRESH_TOKEN to ${file}. Restart the dev/preview server to pick it up.`);
  }
  server.close();
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Open this URL in your browser and approve access:\n');
  console.log(authUrl.toString());
});
