const fs = require('fs');
const { execSync } = require('child_process');

try {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    const lines = envContent.split('\n');

    const varsToPush = [
        'AUTH_SECRET',
        'AUTH_TRUST_HOST',
        'NEXTAUTH_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];

    for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;

        const [key, ...rest] = line.split('=');
        const value = rest.join('=');

        if (varsToPush.includes(key.trim())) {
            console.log(`Setting ${key}...`);
            // Use printf to handle special characters properly
            execSync(`printf "%s" "${value.replace(/"/g, '\\"')}" | vercel env rm ${key} production -y || true`, { stdio: 'pipe' });
            execSync(`printf "%s" "${value.replace(/"/g, '\\"')}" | vercel env add ${key} production`, { stdio: 'inherit' });
        }
    }

    // ensure the new domain is set correctly
    console.log(`Setting NEXTAUTH_URL to https://scams.vitap.ac.in...`);
    execSync(`printf "%s" "https://scams.vitap.ac.in" | vercel env rm NEXTAUTH_URL production -y || true`, { stdio: 'pipe' });
    execSync(`printf "%s" "https://scams.vitap.ac.in" | vercel env add NEXTAUTH_URL production`, { stdio: 'inherit' });

    console.log(`Setting AUTH_URL to https://scams.vitap.ac.in...`);
    execSync(`printf "%s" "https://scams.vitap.ac.in" | vercel env rm AUTH_URL production -y || true`, { stdio: 'pipe' });
    execSync(`printf "%s" "https://scams.vitap.ac.in" | vercel env add AUTH_URL production`, { stdio: 'inherit' });

    console.log('Environment variables updated successfully!');
} catch (e) {
    console.error('Error:', e.message);
}
