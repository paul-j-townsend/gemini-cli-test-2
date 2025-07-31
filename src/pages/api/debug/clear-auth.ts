import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return a script that will clear the auth session on the client
    const script = `
      // Clear Supabase auth from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('vsk')) {
          localStorage.removeItem(key);
        }
      });

      // Clear Supabase auth from sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('vsk')) {
          sessionStorage.removeItem(key);
        }
      });

      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      alert('Auth cleared! Please refresh the page.');
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Clear Auth</title></head>
        <body>
          <h1>Clearing Authentication...</h1>
          <script>${script}</script>
          <p>Auth should be cleared. <a href="/">Return to homepage</a></p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error clearing auth:', error);
    return res.status(500).json({ 
      error: 'Failed to clear auth',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}