# Secured File System with Hyperledger Fabric & IPFS

A simple and secured file system with Hyperledger Fabric and IPFS

# How to User

## Installation

1. Install Prequisite for Hyperledger Fabric : https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html
2. Install Mongodb and setup database : https://docs.mongodb.com/manual/administration/install-community/
3. Install IPFS : https://docs.ipfs.io/install/command-line/
4. Download latest Hyperledger Fabric binaries and docker images

```
$ curl -sSL https://bit.ly/2ysbOFE | bash -s
```

5. Install nvm to use specified npm and node version

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
$ source ~/.bashrc
$ nvm install v12.22.1
```

## Setup & Configuration Hyperledger Fabric

1. Clone this repository

```
$ git clone https://github.com/willysantoso05/secure-fs-fabric-ipfs.git
```

2. Copy the fabric binaries to directory `blockchain/`

```
$ mv fabric-samples/bin secure-fs-fabric-ipfs/blockchain/
```

3. Run fabric network

```
$ cd secure-fs-fabric-ipfs/blockchain/test-network
$ ./up.sh
```

## Setup & Configuration IPFS

1. Run IPFS

```
$ ipfs init
$ ipfs daemon
```

## Setup & Configuration API

1. Back to root repository directory and go to `api` directory

```
$ cd ../../api
```

2. Create .env file from example.env and configure the environment variables

```
$ mv example.env .env
$ nano .env
```

3. Install api package

```
$ npm install
```

4. Enroll admin wallet

```
$ chmod+x initscript.sh
$ ./initscript.sh
```

5. Run API

```
$ node index.js
```

## Author

13517066 | Willy Santoso
