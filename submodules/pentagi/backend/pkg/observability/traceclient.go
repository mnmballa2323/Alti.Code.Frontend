package observability

import (
	"context"

	"pentagi/pkg/config"
)

type NoopTraceClient interface {
	Shutdown(context.Context) error
	Flush(context.Context) error
}

type dummyTraceClient struct{}

func (c dummyTraceClient) Shutdown(context.Context) error { return nil }
func (c dummyTraceClient) Flush(context.Context) error    { return nil }

func NewNoopTraceClient(ctx context.Context, cfg *config.Config) (NoopTraceClient, error) {
	return dummyTraceClient{}, nil
}
