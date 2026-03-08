const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection to:', connectionString ? connectionString.split('@')[1] : 'undefined');

    const client = new Client({ connectionString });

    client.on('error', (err) => {
        console.error('ASYNCHRONOUS ERROR:', err);
    });

    try {
        await client.connect();
        console.log('Successfully connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        await client.end();
        console.log('Connection closed cleanly.');
    } catch (err) {
        console.error('SYNCHRONOUS CONNECTION ERROR:', err);
        process.exit(1);
    }
}

testConnection();
