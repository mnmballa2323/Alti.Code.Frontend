package observability

import (
	"context"

	"pentagi/pkg/config"
	"pentagi/pkg/observability/nooptrace"
)

type NoopTraceClient interface {
	Shutdown(context.Context) error
	Flush(context.Context) error
    ForceFlush(context.Context) error
    Observer() nooptrace.Observer
}

type dummyTraceClient struct{}

func (c dummyTraceClient) Shutdown(context.Context) error { return nil }
func (c dummyTraceClient) Flush(context.Context) error    { return nil }
func (c dummyTraceClient) ForceFlush(context.Context) error { return nil }
func (c dummyTraceClient) Observer() nooptrace.Observer   { return nooptrace.NewNoopObserver() }

func NewNoopTraceClient(ctx context.Context, cfg *config.Config) (NoopTraceClient, error) {
	return dummyTraceClient{}, nil
}
