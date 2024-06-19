

import express from 'express';
import { config } from 'dotenv';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lighthouse from '@lighthouse-web3/sdk';

config({ path: './.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(imageUrl, outputPath) {
    // Ensure the directory exists
    const directory = path.dirname(outputPath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const writer = fs.createWriteStream(outputPath);

    const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
async function uploadToLighthouse(filePath, apiKey) {
  const uploadResponse = await lighthouse.upload(filePath, apiKey);
  const ipfsHash = uploadResponse.data.Hash;
  const lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
  return lighthouseUrl;

}

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

if (!process.env.SERVICE_WALLET_PRIVATE_KEY || !process.env.YOUR_SECRET_KEY || !process.env.CONTRACT_ADDRESS || !process.env.LIGHTHOUSE_API_KEY) {
    console.error('One or more required environment variables are missing.');
    process.exit(1);
}

const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.SERVICE_WALLET_PRIVATE_KEY,
     "base",
    {
        secretKey: process.env.YOUR_SECRET_KEY,
    }
);

app.post('/mintNFT', async (req, res) => {
  console.log('Request Body:', req.body); // Add this line to log the request body
    const { apiId } = req.body;

    if (!apiId || typeof apiId !== 'number') {
        return res.status(400).json({ success: false, message: 'Invalid or missing apiId.' });
    }

    try {
        const apiURL = `https://yourapiurl.com/webNFTdata/${apiId}`;
        const apiResponse = await axios.get(apiURL);
        const { sitename, IPFS_CID, link_id } = apiResponse.data[0];

        const imageUrl = `https://websitethumbnailurl.com/d=${link_id}`;
        const imagePath = path.join(__dirname, `${sitename}.jpg`);

        await downloadImage(imageUrl, imagePath);

        const  lighthouseUrl = await uploadToLighthouse(imagePath, process.env.LIGHTHOUSE_API_KEY);
        console.log("Uploaded to Lighthouse, URL:", lighthouseUrl);
        const contract = await sdk.getContract(process.env.CONTRACT_ADDRESS);
        const metadata = {
            name: sitename,
            description: `This is an NFT for the site: ${sitename}`,
            image: lighthouseUrl,
            animation_url: `ipfs://${IPFS_CID}`, 
            customAnimationUrl: `ipfs://${IPFS_CID}`, 
            // animation_url:"ipfs://bafybeictksypfkcc2uyj432q4zwoynzubaia5scv53sirduvc7angrkpze",
            // customAnimationUrl:"ipfs://bafybeictksypfkcc2uyj432q4zwoynzubaia5scv53sirduvc7angrkpze",
        };

        console.log("Attempting to mint NFT with metadata:", metadata);
       
        const result = await contract.erc721.mint(metadata);

        console.log("Minting successful, result:", result);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Minting failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
