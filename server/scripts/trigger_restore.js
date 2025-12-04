// Using native fetch in Node 18+
const myFetch = global.fetch;

if (!myFetch) {
    console.error('Fetch API not found. Please use Node.js 18+ or install node-fetch.');
    process.exit(1);
}

async function restore() {
    const baseUrl = 'https://vcrm-q4194.sevalla.app/api';

    console.log('Logging in...');
    try {
        const loginRes = await myFetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const { token } = await loginRes.json();
        console.log('Login successful. Starting restore...');

        const restoreRes = await myFetch(`${baseUrl}/restore-legacy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (restoreRes.ok) {
            console.log('Restore successful:', await restoreRes.json());
        } else {
            console.error('Restore failed:', await restoreRes.text());
        }
    } catch (error) {
        console.error('Error during restore:', error);
    }
}

restore();
