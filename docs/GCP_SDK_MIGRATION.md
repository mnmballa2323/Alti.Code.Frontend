# GCP SDK Migration Guide — REST → Native Client Libraries

> **Priority**: Medium — Current REST-via-google-auth-library works reliably.
> Native SDK clients add: automatic retries, streaming, gRPC, better TypeScript types.

## Migration Order (by impact)

### Phase 1 — High-Traffic Services (migrate first)
| Service | Current | Target SDK | Benefit |
|---------|---------|-----------|---------|
| `gcpFirestore` | Already native | `@google-cloud/firestore` | ✅ Done |
| `gcpStorage` | Already native | `@google-cloud/storage` | ✅ Done |
| `gcpPubSub` | Already native | `@google-cloud/pubsub` | ✅ Done |
| `gcpVision` | REST API | `@google-cloud/vision` (ImageAnnotatorClient) | Streaming, batch |
| `gcpDocumentAI` | REST API | `@google-cloud/document-ai` (DocumentProcessorServiceClient) | Batch processing |
| `gcpSearch` | REST API | `@google-cloud/discoveryengine` (SearchServiceClient) | Paging, streaming |

### Phase 2 — Security & Compliance
| Service | Current | Target SDK |
|---------|---------|-----------|
| `gcpDlp` | Already native | ✅ Done |
| `gcpSecretManager` | Already native | ✅ Done |
| `gcpContainerSecurity` | REST API | `@google-cloud/containeranalysis` |
| `gcpBinaryAuth` | REST API | `google-auth-library` (no native SDK) — keep as-is |

### Phase 3 — Data & Analytics
| Service | Current | Target SDK |
|---------|---------|-----------|
| `gcpBigtable` | REST API | `@google-cloud/bigtable` (Instance, Table clients) |
| `gcpDataproc` | REST API | `@google-cloud/dataproc` (ClusterControllerClient) |
| `gcpDataCatalog` | REST API | `@google-cloud/datacatalog` (DataCatalogClient) |

### Phase 4 — Remaining (low urgency)
All other REST-based services. Many GCP APIs don't have Node.js client libraries,
so REST via `google-auth-library` is the correct permanent approach for those.

## Migration Pattern
```js
// BEFORE (REST)
const { data } = await this.client.request({
  url: `https://vision.googleapis.com/v1/images:annotate`,
  method: 'POST',
  data: { requests: [{ image: { source: { imageUri } }, features }] },
});

// AFTER (Native SDK)
const [result] = await this.client.annotateImage({
  image: { source: { imageUri } },
  features,
});
```

## Rules
1. Migrate one service at a time
2. Keep the same export name and method signatures
3. Add unit test before migration, verify after
4. Test in staging before production
