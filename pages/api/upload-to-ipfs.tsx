import { NextApiRequest, NextApiResponse } from 'next';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.resolve(__dirname, '.env.local') });

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body);
    const { content, filename } = req.body;
    
    if (!content || !filename) {
      throw new Error('Missing content or filename');
    }

    console.log('Converting base64 to buffer...');
    const buffer = Buffer.from(content, 'base64');

    console.log('Creating readable stream...');
    const stream = Readable.from(buffer);

    console.log('Uploading to Pinata...');
    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: {
        name: filename,
      },
    });

    console.log('Pinata upload result:', result);
    res.status(200).json({ ipfsHash: result.IpfsHash });
  } catch (error) {
    console.error('Error in IPFS upload:', error);
    res.status(500).json({ 
      message: 'Error uploading to IPFS', 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}