cd /app/api
chmod +x initscript.sh
./initscript.sh
node index.js &

cd ../client
npm run serve -- --port ${CLIENT_PORT}