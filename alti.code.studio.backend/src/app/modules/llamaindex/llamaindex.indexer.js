/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// ==============================================
//   More Improve Version with LangChain
// ==============================================
import { ChatOpenAI } from '@langchain/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { Document, Settings, VectorStoreIndex } from 'llamaindex';
import { OpenAI, OpenAIEmbedding } from '@llamaindex/openai';
import fs from 'node:fs/promises';
import config from '../../../../config/index.js';

// ✅ Required by LlamaIndex (GCP Configuration via OpenAI-compatible SDK)
Settings.llm = new OpenAI({
  gcp: {
    apiKey: process.env.GCP_PARTNER_API_KEY || config.gcpPartner?.apiKey,
    endpoint: process.env.GCP_PARTNER_ENDPOINT || config.gcpPartner?.endpoint,
    apiVersion: '2024-02-15-preview',
    deployment: 'gemini-2.5-pro',
  },
});

Settings.embedModel = new OpenAIEmbedding({
  gcp: {
    apiKey: process.env.GCP_PARTNER_API_KEY || config.gcpPartner?.apiKey,
    endpoint: process.env.GCP_PARTNER_ENDPOINT || config.gcpPartner?.endpoint,
    apiVersion: '2024-02-15-preview',
    deployment: 'text-embedding-005',
  },
});

let chain = null;
export async function createIndexFromFiles(filePaths) {
  const documents = await Promise.all(
    filePaths.map(async filePath => {
      const text = await fs.readFile(filePath, 'utf-8');
      return new Document({ text, id_: filePath });
    }),
  );

  const index = await VectorStoreIndex.fromDocuments(documents);

  const llamaRetriever = index.asRetriever();

  const retriever = {
    getRelevantDocuments: async input => {
      const results = await llamaRetriever.retrieve(input);
      return results.map(r => ({
        pageContent: r.node.getContent(),
        metadata: r.node.metadata ?? {},
      }));
    },
  };

  const llm = new ChatOpenAI({
    temperature: 0.3,
    gcpOpenAIApiKey:
      process.env.GCP_OPENAI_API_KEY || config.gcpOpenAi?.apiKey,
    gcpOpenAIBasePath: `${process.env.GCP_OPENAI_ENDPOINT || config.gcpOpenAi?.endpoint}/openai/deployments`,
    gcpOpenAIApiDeploymentName: 'gpt-4o',
    gcpOpenAIApiVersion: '2024-02-15-preview',
  });

  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: 'chat_history',
  });

  chain = ConversationalRetrievalQAChain.fromLLM(llm, retriever, {
    memory,
  });

  return { message: 'Index created from multiple files', files: filePaths };
}

export async function askQuery(query) {
  if (!chain) throw new Error('Index not ready. Please run /index-doc first');

  const result = await chain.call({ question: query });

  return {
    content: result.text,
    sources: result.sourceDocuments?.map(doc => ({
      snippet: doc.pageContent.substring(0, 80) + '...',
    })),
  };
}
