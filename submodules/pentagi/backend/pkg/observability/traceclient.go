package observability

import (
	"context"
	"pentagi/pkg/observability/nooptrace"
)

type NoopTraceClient interface {
	nooptrace.Observer
	ForceFlush(ctx context.Context) error
	Shutdown(ctx context.Context) error
	Observer() nooptrace.Observer
}

type dummyNoopTraceClient struct {
	nooptrace.Observation
}

func (d dummyNoopTraceClient) ForceFlush(ctx context.Context) error { return nil }
func (d dummyNoopTraceClient) Shutdown(ctx context.Context) error { return nil }
func (d dummyNoopTraceClient) NewObservation(context.Context, ...nooptrace.ObservationContextOption) (context.Context, nooptrace.Observation) { return context.Background(), nooptrace.NewDummyObservation() }
func (d dummyNoopTraceClient) Observer() nooptrace.Observer { return nooptrace.NewNoopObserver() }

func NewNoopTraceClient() NoopTraceClient {
	return dummyNoopTraceClient{}
}
