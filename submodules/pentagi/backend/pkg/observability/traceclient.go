package observability

import (
	"context"
	"pentagi/pkg/observability/nooptrace"
)

type NoopTraceClient interface {
	nooptrace.Observer
	Flush(ctx context.Context) error
	Shutdown(ctx context.Context) error
}

type dummyNoopTraceClient struct {
	nooptrace.Observation
}

func (d dummyNoopTraceClient) Flush(ctx context.Context) error { return nil }
func (d dummyNoopTraceClient) Shutdown(ctx context.Context) error { return nil }
func (d dummyNoopTraceClient) NewObservation(context.Context, ...nooptrace.ObservationContextOption) (context.Context, nooptrace.Observation) { return context.Background(), nooptrace.NewDummyObservation() }

func NewNoopTraceClient() NoopTraceClient {
	return dummyNoopTraceClient{}
}
