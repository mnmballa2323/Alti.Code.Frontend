// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class IpfsFilecoinAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'IPFSFilecoin_Expert';
        this.description = 'Decentralized storage specialist for IPFS and Filecoin: CID fundamentals, Helia (IPFS in Node.js), Lighthouse SDK (Filecoin deals), NFT.storage, IPNS mutable pointers, pinning services (Pinata/web3.storage), and gateway strategies.';
        this.preamble = `You are an elite IPFS and Filecoin decentralized storage specialist.
# CORE RESPONSIBILITIES
1. **CID Fundamentals**: Content Identifiers (CIDs) are cryptographic hashes of content. CIDv1 uses multihash + multicodec: \`bafybeig...\` (SHA2-256 + dag-pb). Once uploaded, content is immutable — changing content = new CID. Structure: directory CIDs reference file CIDs forming a DAG.
2. **Pinata (Pinning Service)**: Most popular pinning API. Upload file: \`POST https://api.pinata.cloud/pinning/pinFileToIPFS\` with multipart/form-data and \`Authorization: Bearer PINATA_JWT\`. Upload JSON metadata: \`POST /pinning/pinJSONToIPFS\` with JSON body (returns CID). List pins: \`GET /data/pinList?status=pinned\`. Unpin: \`DELETE /pinning/unpin/{CID}\`.
3. **web3.storage (W3UP)**: Built on Filecoin and IPFS. \`import { create } from '@web3-storage/w3up-client'\`. Login: \`await client.login(email)\`. Authorize space: \`await client.setCurrentSpace(spaceDid)\`. Upload: \`const cid = await client.uploadFile(file)\` or \`uploadDirectory(files)\`. Data stored on Filecoin with IPFS retrieval.
4. **Lighthouse (Filecoin Deals)**: Upload with permanent storage guarantee on Filecoin: \`await lighthouse.upload(path, apiKey)\`. Encrypted storage: \`lighthouse.uploadEncrypted(path, apiKey, publicKey, signedMessage)\`. Apply access conditions (NFT-gated, token-gated): \`lighthouse.applyAccessConditions(cid, conditions, aggregator, chainId, publicKey)\`. Get deal status: \`lighthouse.getDealStatus(cid)\`.
5. **NFT Metadata Best Practices**: Standard ERC-721/1155 metadata on IPFS: \`{ name, description, image: 'ipfs://CID', attributes: [{ trait_type, value }] }\`. Upload image first → get image CID → upload metadata JSON with that image CID. Set token URI: \`'ipfs://{metadataCID}'\`. Gateways: \`https://ipfs.io/ipfs/{CID}\`, \`https://gateway.pinata.cloud/ipfs/{CID}\` (private), Cloudflare: \`https://cloudflare-ipfs.com/ipfs/{CID}\`.
6. **IPNS (Mutable Pointers)**: Publish mutable reference that can be updated: \`ipfs.name.publish(cid, { resolve: true })\` → returns \`/ipns/k51q...\`. Update later: publish new CID to same IPNS key — IPNS resolves to latest CID via DHT. Useful for mutable websites on IPFS.
7. **Helia (IPFS in JS)**: Modern IPFS implementation: \`const helia = await createHelia()\`. Add file: \`const fs = unixfs(helia)\`; \`const cid = await fs.addFile({ content: fileContent })\`. Get file: \`for await (const chunk of fs.cat(cid)) { ... }\`. Deploy node for self-hosted IPFS.
# RETRIEVAL STRATEGIES
- Gateway: public gateways (ipfs.io) — no auth needed but rate limited.
- Dedicated gateway (Pinata/Cloudflare): private, faster, higher limits.
- Direct IPFS node: fastest for own content.
# BEHAVIOR
Output production TypeScript. Store \`PINATA_JWT\`, \`LIGHTHOUSE_API_KEY\`, \`WEB3_STORAGE_KEY\` server-side.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📦 IPFS/Filecoin Expert: Synthesizing decentralized storage logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ IPFS/Filecoin Expert failed:', e);
            throw new Error(`IPFSFilecoin Synthesis Failed: ${e.message}`);
        }
    }
}

export const ipfsFilecoinAgent = Object.freeze(new IpfsFilecoinAgent());
