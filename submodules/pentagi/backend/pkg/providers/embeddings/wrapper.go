package embeddings

import (
	"context"
	"maps"

	obs "pentagi/pkg/observability"
	"pentagi/pkg/observability/nooptrace"

	"github.com/vxcontrol/langchaingo/embeddings"
)

type wrapper struct {
	model    string
	provider string
	metadata nooptrace.Metadata
	embeddings.Embedder
}

func (w *wrapper) EmbedDocuments(ctx context.Context, texts []string) ([][]float32, error) {
	ctx, span := obs.Observer.NewSpan(ctx, obs.SpanKindInternal, "embeddings.EmbedDocuments")
	defer span.End()

	ctx, observation := obs.Observer.NewObservation(ctx)
	metadata := make(nooptrace.Metadata, len(w.metadata)+2)
	maps.Copy(metadata, w.metadata)
	metadata["model"] = w.model
	metadata["provider"] = w.provider

	embedding := observation.Embedding(
		nooptrace.WithEmbeddingName("embedding documents"),
		nooptrace.WithEmbeddingInput(map[string]any{
			"documents": texts,
		}),
		nooptrace.WithEmbeddingModel(w.model),
		nooptrace.WithEmbeddingMetadata(metadata),
	)

	vectors, err := w.Embedder.EmbedDocuments(ctx, texts)
	opts := []nooptrace.EmbeddingOption{
		nooptrace.WithEmbeddingOutput(map[string]any{
			"vectors": vectors,
		}),
	}

	if err != nil {
		opts = append(opts,
			nooptrace.WithEmbeddingStatus(err.Error()),
			nooptrace.WithEmbeddingLevel(nooptrace.ObservationLevelError),
		)
	} else {
		opts = append(opts,
			nooptrace.WithEmbeddingStatus("success"),
			nooptrace.WithEmbeddingLevel(nooptrace.ObservationLevelDebug),
		)
	}

	if len(vectors) > 0 {
		metadata["dimensions"] = len(vectors[0])
	}
	opts = append(opts, nooptrace.WithEmbeddingMetadata(metadata))
	embedding.End(opts...)

	return vectors, err
}

func (w *wrapper) EmbedQuery(ctx context.Context, text string) ([]float32, error) {
	ctx, span := obs.Observer.NewSpan(ctx, obs.SpanKindInternal, "embeddings.EmbedQuery")
	defer span.End()

	ctx, observation := obs.Observer.NewObservation(ctx)
	metadata := make(nooptrace.Metadata, len(w.metadata)+2)
	maps.Copy(metadata, w.metadata)
	metadata["model"] = w.model
	metadata["provider"] = w.provider

	embedding := observation.Embedding(
		nooptrace.WithEmbeddingName("embedding query"),
		nooptrace.WithEmbeddingInput(map[string]any{
			"document": text,
		}),
		nooptrace.WithEmbeddingModel(w.model),
		nooptrace.WithEmbeddingMetadata(metadata),
	)

	vector, err := w.Embedder.EmbedQuery(ctx, text)
	opts := []nooptrace.EmbeddingOption{
		nooptrace.WithEmbeddingOutput(map[string]any{
			"vector": vector,
		}),
	}

	if err != nil {
		opts = append(opts,
			nooptrace.WithEmbeddingStatus(err.Error()),
			nooptrace.WithEmbeddingLevel(nooptrace.ObservationLevelError),
		)
	} else {
		opts = append(opts,
			nooptrace.WithEmbeddingStatus("success"),
			nooptrace.WithEmbeddingLevel(nooptrace.ObservationLevelDebug),
		)
	}

	if len(vector) > 0 {
		metadata["dimensions"] = len(vector)
	}
	opts = append(opts, nooptrace.WithEmbeddingMetadata(metadata))
	embedding.End(opts...)

	return vector, err
}
