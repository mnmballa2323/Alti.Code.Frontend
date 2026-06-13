package nooptrace

import "context"

type ObservationLevel string
const (
    ObservationLevelError ObservationLevel = "ERROR"
    ObservationLevelWarning ObservationLevel = "WARNING"
    ObservationLevelDebug ObservationLevel = "DEBUG"
)

type ObservationContextOption func()
type EmbeddingOption = ObservationContextOption
type ToolOption = ObservationContextOption
type EventOption = ObservationContextOption

type Metadata map[string]interface{}
type GenerationUsage struct {
    InputCost       *float64
    OutputCost      *float64
    TotalCost       *float64
    Input           int
    Output          int
    Total           int
    Unit            string
}
const GenerationUsageUnitTokens = "TOKENS"

func WithAgentName(name string) ObservationContextOption { return func() {} }
func WithAgentInput(input any) ObservationContextOption { return func() {} }
func WithAgentOutput(output any) ObservationContextOption { return func() {} }
func WithAgentStatus(status string) ObservationContextOption { return func() {} }
func WithAgentLevel(level ObservationLevel) ObservationContextOption { return func() {} }
func WithObservationName(name string) ObservationContextOption { return func() {} }
func WithObservationInput(input any) ObservationContextOption { return func() {} }
func WithObservationOutput(output any) ObservationContextOption { return func() {} }
func WithObservationStatus(status string) ObservationContextOption { return func() {} }
func WithObservationLevel(level ObservationLevel) ObservationContextOption { return func() {} }
func WithObservationModel(model string) ObservationContextOption { return func() {} }
func WithObservationModelParameters(params any) ObservationContextOption { return func() {} }
func WithObservationUsage(usage any) ObservationContextOption { return func() {} }
func WithObservationVersion(version string) ObservationContextOption { return func() {} }
func WithObservationTags(tags []string) ObservationContextOption { return func() {} }

func WithGenerationName(name string) ObservationContextOption { return func() {} }
func WithGenerationMetadata(metadata any) ObservationContextOption { return func() {} }
func WithGenerationInput(input any) ObservationContextOption { return func() {} }
func WithGenerationTools(tools any) ObservationContextOption { return func() {} }
func WithGenerationModel(model string) ObservationContextOption { return func() {} }
func WithGenerationModelParameters(params any) ObservationContextOption { return func() {} }
func GetLangchainModelParameters(opts ...any) any { return nil }
func WithGenerationStatus(status string) ObservationContextOption { return func() {} }
func WithGenerationLevel(level ObservationLevel) ObservationContextOption { return func() {} }
func WithGenerationOutput(output any) ObservationContextOption { return func() {} }
func WithGenerationUsage(usage *GenerationUsage) ObservationContextOption { return func() {} }

func WithEventName(name string) ObservationContextOption { return func() {} }
func WithEventInput(input any) ObservationContextOption { return func() {} }
func WithEventOutput(output any) ObservationContextOption { return func() {} }
func WithEventMetadata(metadata any) ObservationContextOption { return func() {} }
func WithEventStatus(status string) ObservationContextOption { return func() {} }
func WithEventLevel(level ObservationLevel) ObservationContextOption { return func() {} }

func WithSpanName(name string) ObservationContextOption { return func() {} }

func WithEmbeddingName(name string) EmbeddingOption { return func() {} }
func WithEmbeddingMetadata(metadata any) EmbeddingOption { return func() {} }
func WithEmbeddingModel(model string) EmbeddingOption { return func() {} }
func WithEmbeddingInput(input any) EmbeddingOption { return func() {} }
func WithEmbeddingOutput(output any) EmbeddingOption { return func() {} }
func WithEmbeddingStatus(status string) EmbeddingOption { return func() {} }
func WithEmbeddingLevel(level ObservationLevel) EmbeddingOption { return func() {} }

func WithRetrieverName(name string) ObservationContextOption { return func() {} }
func WithRetrieverInput(input any) ObservationContextOption { return func() {} }
func WithRetrieverMetadata(metadata any) ObservationContextOption { return func() {} }
func WithRetrieverStatus(status string) ObservationContextOption { return func() {} }
func WithRetrieverLevel(level ObservationLevel) ObservationContextOption { return func() {} }
func WithRetrieverOutput(output any) ObservationContextOption { return func() {} }

func WithScoreComment(comment string) ObservationContextOption { return func() {} }
func WithScoreName(name string) ObservationContextOption { return func() {} }
func WithScoreStringValue(value string) ObservationContextOption { return func() {} }
func WithScoreFloatValue(value float64) ObservationContextOption { return func() {} }

type Agent interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type Observation interface {
    Agent(...ObservationContextOption) Agent
    Generation(...ObservationContextOption) Generation
    Span(...ObservationContextOption) Span
    Event(...ObservationContextOption) Event
    Embedding(...EmbeddingOption) Embedding
    Tool(...ObservationContextOption) Tool
    Retriever(...ObservationContextOption) Retriever
    Score(...ObservationContextOption) Score
    Evaluator(...ObservationContextOption) Evaluator
    End(...ObservationContextOption)
    ID() string
    TraceID() string
}

type Generation interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type Span interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type Event interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type Embedding interface {
    Observation(context.Context) (context.Context, Observation)
    End(...EmbeddingOption)
}

type Tool interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type Retriever interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type Score interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type dummyAgent struct{}
func (d dummyAgent) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyAgent) End(...ObservationContextOption) {}

type dummyObservation struct{}
func (d dummyObservation) Agent(...ObservationContextOption) Agent { return dummyAgent{} }
func (d dummyObservation) Generation(...ObservationContextOption) Generation { return dummyGeneration{} }
func (d dummyObservation) Span(...ObservationContextOption) Span { return dummySpan{} }
func (d dummyObservation) Event(...ObservationContextOption) Event { return dummyEvent{} }
func (d dummyObservation) Embedding(...EmbeddingOption) Embedding { return dummyEmbedding{} }
func (d dummyObservation) Tool(...ObservationContextOption) Tool { return dummyTool{} }
func (d dummyObservation) Retriever(...ObservationContextOption) Retriever { return dummyRetriever{} }
func (d dummyObservation) Score(...ObservationContextOption) Score { return dummyScore{} }
func (d dummyObservation) Evaluator(...ObservationContextOption) Evaluator { return dummyEvaluator{} }
func (d dummyObservation) End(...ObservationContextOption) {}
func (d dummyObservation) ID() string { return "" }
func (d dummyObservation) TraceID() string { return "" }

type dummyGeneration struct{}
func (d dummyGeneration) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyGeneration) End(...ObservationContextOption) {}

type dummySpan struct{}
func (d dummySpan) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummySpan) End(...ObservationContextOption) {}

type dummyEvent struct{}
func (d dummyEvent) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyEvent) End(...ObservationContextOption) {}

type dummyEmbedding struct{}
func (d dummyEmbedding) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyEmbedding) End(...EmbeddingOption) {}

type dummyTool struct{}
func (d dummyTool) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyTool) End(...ObservationContextOption) {}

type dummyRetriever struct{}
func (d dummyRetriever) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyRetriever) End(...ObservationContextOption) {}

type dummyScore struct{}
func (d dummyScore) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyScore) End(...ObservationContextOption) {}

func NewDummyObservation() Observation { return dummyObservation{} }

type Observer interface {
    NewObservation(context.Context, ...ObservationContextOption) (context.Context, Observation)
}

func NewNoopObserver() Observer {
    return dummyObserver{}
}

type dummyObserver struct{}
func (d dummyObserver) NewObservation(ctx context.Context, _ ...ObservationContextOption) (context.Context, Observation) {
    return ctx, dummyObservation{}
}

type AgentOption = ObservationContextOption
type SpanOption = ObservationContextOption

func WithToolOutput(output any) ObservationContextOption { return func() {} }
func WithToolStatus(status string) ObservationContextOption { return func() {} }
func WithToolLevel(level ObservationLevel) ObservationContextOption { return func() {} }

func WithSpanOutput(output any) ObservationContextOption { return func() {} }
func WithSpanStatus(status string) ObservationContextOption { return func() {} }
func WithSpanLevel(level ObservationLevel) ObservationContextOption { return func() {} }

func WithToolName(name string) ObservationContextOption { return func() {} }
func WithToolInput(input any) ObservationContextOption { return func() {} }
func WithToolMetadata(metadata any) ObservationContextOption { return func() {} }
func WithAgentMetadata(metadata any) ObservationContextOption { return func() {} }
func WithSpanInput(input any) ObservationContextOption { return func() {} }
func WithSpanMetadata(metadata any) ObservationContextOption { return func() {} }

type Evaluator interface {
    Observation(context.Context) (context.Context, Observation)
    End(...ObservationContextOption)
}

type dummyEvaluator struct{}
func (d dummyEvaluator) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyEvaluator) End(...ObservationContextOption) {}

func WithEvaluatorName(name string) ObservationContextOption { return func() {} }
func WithEvaluatorInput(input any) ObservationContextOption { return func() {} }
func WithEvaluatorMetadata(metadata any) ObservationContextOption { return func() {} }
func WithEvaluatorOutput(output any) ObservationContextOption { return func() {} }
func WithEvaluatorStatus(status string) ObservationContextOption { return func() {} }
func WithEvaluatorLevel(level ObservationLevel) ObservationContextOption { return func() {} }
