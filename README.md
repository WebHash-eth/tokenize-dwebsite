# tokenize Website Service

This repository contains the code for tokenizing an IPFS website into an NFT using Node.js, Express, Thirdweb SDK, and Lighthouse Web3 SDK. The service downloads an image, uploads it to IPFS via Lighthouse, and mints an NFT with the uploaded image and metadata.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. **Clone the repository:**

```bash
git clone <repository_url>
cd <repository_directory>
```

2. **Install dependencies:**

```bash
npm install
```

3. **Environment Variables:**

Create a `.env.local` file in the root directory of your project and add the following variables:

```dotenv
YOUR_SECRET_KEY=
CONTRACT_ADDRESS=
SERVICE_WALLET_PRIVATE_KEY=
SERVICE_WALLET_ADDRESS=
CLIENT_ID= 
LIGHTHOUSE_API_KEY= 
```

## Running the Service

Start the server by running:

```bash
npm start
```

The server will start on the port specified in the `.env.local` file (default is 3001).

## API Endpoint

### Mint NFT

**URL:** `/mintNFT`  
**Method:** `POST`  
**Headers:** 
- `Content-Type: application/json`

**Request Body:**

```json
{
  "apiId": 1 // Replace with the actual API ID you want to use
}
```

**Response:**

- **Success:** 

```json
{
  "success": true,
  "data": {
    // Minting result data
  }
}
```

- **Failure:**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Code Explanation

### Main Components

1. **Dependencies:**

```javascript
import express from 'express';
import { config } from 'dotenv';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lighthouse from '@lighthouse-web3/sdk';
```

2. **Environment Configuration:**

```javascript
config({ path: './.env.local' });
```

3. **Express Server Setup:**

```javascript
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
```

4. **Thirdweb SDK Initialization:**

```javascript
const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.SERVICE_WALLET_PRIVATE_KEY,
    "base",
    {
        secretKey: process.env.YOUR_SECRET_KEY,
    }
);
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.

---

Feel free to customize the README further based on your specific needs or project structure.
