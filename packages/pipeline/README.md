# Mostval Pipeline

## Description

A TypeScript library for data pipeline processing, providing a flexible and extensible approach to data transformation, validation, caching, logging, and enrichment using RxJS Observables.

## Installation

```bash
npm install @mostval/pipeline
```

## Key Features

- ✨ Synchronous and asynchronous pipeline processing
- 🔄 Observable-based chain processing (RxJS)
- ✅ Validation with custom rules
- 🧹 Data sanitization
- 🔍 Data enrichment
- 📝 Logging with sensitive data masking
- 💾 Caching with TTL support
- 🔁 Retry mechanism with custom policies
- 📊 Strong TypeScript typing
- 🔌 Extensible architecture
- 🧪 100% test coverage

## Core Stages

### ValidationStage

Validates input data against a set of rules:

```typescript
const validationStage = new ValidationStage<UserData>([{
  validate: async (data) => {
    const errors = [];
    if (!data.email) errors.push('Email is required');
    return errors;
  }
}]);
```

### TransformationStage

Transforms data between stages:

```typescript
const transformStage = new TransformationStage<Input, Output>(
  data => ({ ...data, timestamp: Date.now() })
);
```

### SanitizationStage

Cleanses and normalizes data:

```typescript
const sanitizationStage = new SanitizationStage<UserData>([{
  field: 'email',
  sanitize: value => String(value).trim().toLowerCase()
}]);
```

### EnrichmentStage

Enriches data with external information:

```typescript
const enrichmentStage = new EnrichmentStage({
  name: 'UserEnricher',
  enrich: async (user) => {
    const details = await fetchUserDetails(user.id);
    return { ...user, ...details };
  }
});
```

### LoggingStage

Logs pipeline execution with sensitive data masking:

```typescript
const loggingStage = new LoggingStage(logger, {
  logData: true,
  maskFields: ['password', 'creditCard']
});
```

### CachingStage

Caches stage results with TTL support:

```typescript
const cachingStage = new CachingStage(innerStage, cache, {
  ttl: 3600,
  keyGenerator: (data) => `user:${data.id}`
});
```

### RetryStage

Retries failed operations with custom policies:

```typescript
const retryStage = new RetryStage(innerStage, {
  maxAttempts: 3,
  delay: 1000,
  shouldRetry: (error) => error.code === 'NETWORK_ERROR'
});
```

## Pipeline Composition

```typescript
const pipeline = new Pipeline<InputData, OutputData>()
  .addStage(new LoggingStage(logger))
  .addStage(new ValidationStage(validators))
  .addStage(new SanitizationStage(sanitizers))
  .addStage(new CachingStage(
    new EnrichmentStage(enricher),
    cache,
    cacheOptions
  ))
  .addStage(new RetryStage(
    new TransformationStage(transformer),
    retryPolicy
  ));

pipeline.execute(inputData).subscribe({
  next: (result) => console.log('Success:', result),
  error: (error) => console.error('Error:', error),
  complete: () => console.log('Pipeline completed')
});
```

## Error Handling

Each stage can implement custom error handling:

```typescript
class CustomStage implements Stage<Input, Output> {
  async handleError(error: Error, context: Input): Promise<Output> {
    if (error instanceof ValidationError) {
      // Handle validation errors
      return fallbackValue;
    }
    throw error; // Re-throw other errors
  }
}
```

## Development

```bash
npm run build   # Build the library
npm run test    # Run tests with coverage
npm run lint    # Run linting
```

## License

MIT License
