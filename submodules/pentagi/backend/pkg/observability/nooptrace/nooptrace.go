package nooptrace

import "context"

type ObservationLevel string

const (
	ObservationLevelError ObservationLevel = "ERROR"
)

type ObservationContextOption func()

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


type Agent interface {
	Observation(context.Context) (context.Context, Observation)
	End(...ObservationContextOption)
}

type Observation interface {
	Agent(...ObservationContextOption) Agent
	Generation(...ObservationContextOption) Generation
	Span(...ObservationContextOption) Span
	Event(...ObservationContextOption) Event
	End(...ObservationContextOption)
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

type dummyAgent struct{}
func (d dummyAgent) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyAgent) End(...ObservationContextOption) {}

type dummyObservation struct{}
func (d dummyObservation) Agent(...ObservationContextOption) Agent { return dummyAgent{} }
func (d dummyObservation) Generation(...ObservationContextOption) Generation { return dummyGeneration{} }
func (d dummyObservation) Span(...ObservationContextOption) Span { return dummySpan{} }
func (d dummyObservation) Event(...ObservationContextOption) Event { return dummyEvent{} }
func (d dummyObservation) End(...ObservationContextOption) {}

type dummyGeneration struct{}
func (d dummyGeneration) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyGeneration) End(...ObservationContextOption) {}

type dummySpan struct{}
func (d dummySpan) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummySpan) End(...ObservationContextOption) {}

type dummyEvent struct{}
func (d dummyEvent) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyEvent) End(...ObservationContextOption) {}

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

type Metadata map[string]interface{}

func WithGenerationName(name string) ObservationContextOption { return func() {} }
func WithGenerationMetadata(metadata any) ObservationContextOption { return func() {} }
func WithGenerationInput(input any) ObservationContextOption { return func() {} }
func WithGenerationTools(tools any) ObservationContextOption { return func() {} }
func WithGenerationModel(model string) ObservationContextOption { return func() {} }
func WithGenerationModelParameters(params any) ObservationContextOption { return func() {} }
func GetLangchainModelParameters(opts ...any) any { return nil }

func WithEventName(name string) ObservationContextOption { return func() {} }
func WithEventInput(input any) ObservationContextOption { return func() {} }
func WithEventOutput(output any) ObservationContextOption { return func() {} }

func WithSpanName(name string) ObservationContextOption { return func() {} }

func WithEmbeddingName(name string) ObservationContextOption { return func() {} }
func WithEmbeddingMetadata(metadata any) ObservationContextOption { return func() {} }
func WithEmbeddingModel(model string) ObservationContextOption { return func() {} }

type Embedding interface {
	Observation(context.Context) (context.Context, Observation)
	End(...ObservationContextOption)
}

func (d dummyObservation) Embedding(...ObservationContextOption) Embedding { return dummyEmbedding{} }

type dummyEmbedding struct{}
func (d dummyEmbedding) Observation(ctx context.Context) (context.Context, Observation) { return ctx, dummyObservation{} }
func (d dummyEmbedding) End(...ObservationContextOption) {}

const (
    ObservationLevelWarning ObservationLevel = "WARNING"
    ObservationLevelDebug ObservationLevel = "DEBUG"
)

func WithEventMetadata(metadata any) ObservationContextOption { return func() {} }
func WithEventStatus(status string) ObservationContextOption { return func() {} }
func WithEventLevel(level ObservationLevel) ObservationContextOption { return func() {} }

func WithGenerationStatus(status string) ObservationContextOption { return func() {} }
func WithGenerationLevel(level ObservationLevel) ObservationContextOption { return func() {} }
func WithGenerationOutput(output any) ObservationContextOption { return func() {} }

type EmbeddingOption func()

func WithEmbeddingInput(input any) ObservationContextOption { return func() {} }
func WithEmbeddingOutput(output any) ObservationContextOption { return func() {} }
func WithEmbeddingStatus(status string) ObservationContextOption { return func() {} }
func WithEmbeddingLevel(level ObservationLevel) ObservationContextOption { return func() {} }
