import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";

let vectorStore;

/**
 * Initializes the vector store.
 * Requires process.env.MONGO_URI, process.env.DB_NAME, and process.env.OPENAI_API_KEY (or compatible).
 */
export const getVectorStore = async () => {
    if (vectorStore) return vectorStore;

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const collection = client.db(process.env.DB_NAME || "test").collection("vectors");

    // Note: DeepSeek doesn't provide an embeddings endpoint.
    // We use OpenAIEmbeddings if a key is provided, otherwise we fallback to a placeholder.
    let embeddings;
    if (process.env.OPENAI_API_KEY) {
        console.log("✅ Using OpenAI Embeddings");
        embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    } else {
        console.log("ℹ️ OPENAI_API_KEY missing. Using local HuggingFace embeddings (all-MiniLM-L6-v2)");
        embeddings = new HuggingFaceTransformersEmbeddings({
            model: "Xenova/all-MiniLM-L6-v2",
        });
    }

    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
    });

    return vectorStore;
};

/**
 * Stores text in the vector database after chunking.
 */
export const storeTextToVector = async (text, metadata = {}) => {
    const store = await getVectorStore();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text], [metadata]);

    await store.addDocuments(docs);
    return docs.length;
};

/**
 * Searches for relevant chunks.
 */
export const searchVectorStore = async (query, k = 5, filter = {}) => {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, k, filter);
    return results;
};
