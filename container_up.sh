docker run -e MONGODB_URI=mongodb://localhost:27017/fabric-ipfs -e JWT_SECRET=MYSECRETTOKEN -e API_PORT=3001 -e CLIENT_PORT=8081 --net host --name app1 -d my-image
docker run -e MONGODB_URI=mongodb://localhost:27017/fabric-ipfs -e JWT_SECRET=MYSECRETTOKEN -e API_PORT=3002 -e CLIENT_PORT=8082 --net host --name app2 -d my-image
docker run -e MONGODB_URI=mongodb://localhost:27017/fabric-ipfs -e JWT_SECRET=MYSECRETTOKEN -e API_PORT=3003 -e CLIENT_PORT=8083 --net host --name app3 -d my-image