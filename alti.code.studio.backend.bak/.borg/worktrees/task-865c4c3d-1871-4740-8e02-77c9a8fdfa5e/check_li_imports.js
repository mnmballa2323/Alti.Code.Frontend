try {
    const li = await import('llamaindex');
    console.log('✅ OpenAIEmbedding:', !!li.OpenAIEmbedding);
    console.log('✅ Settings:', !!li.Settings);
    console.log('✅ VectorStoreIndex:', !!li.VectorStoreIndex);
    console.log('✅ Document:', !!li.Document);
    console.log('✅ BaseEmbedding:', !!li.BaseEmbedding);
    console.log('✅ SimilarityType:', !!li.SimilarityType);
} catch (e) {
    console.log('❌ Import failed:', e.message);
}
