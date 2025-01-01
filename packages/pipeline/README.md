# Mostval Pipeline

## Description

A TypeScript library for data pipeline processing, providing a flexible and extensible approach to data transformation and validation using RxJS Observables.

## Installation

```bash
npm install edtech-ava-libs-flux
```

## Key Features

- ✨ Synchronous and asynchronous pipeline processing
- 🔄 Observable-based chain processing (RxJS)
- ✅ Customizable validation and transformation stages
- 📝 Strong TypeScript typing
- 🔌 Extensible architecture
- 🧪 Comprehensive test coverage

## Quick Start

### Basic Pipeline

```typescript
import { Pipeline, ValidationStage, TransformationStage } from '@mostval/pipeline';

// Define your data structure
interface DataItem {
  id: string;
  value: number;
}

// Create and configure pipeline
const pipeline = new Pipeline<DataItem, DataItem>();

// Add validation stage
pipeline.addStage(
  new ValidationStage<DataItem>((data) =>
    data.id !== '' && data.value >= 0
  )
);

// Add transformation stage
pipeline.addStage(
  new TransformationStage<DataItem, DataItem>((data) => ({
    ...data,
    value: data.value * 2
  }))
);

// Execute pipeline
pipeline.execute({
  id: '123',
  value: 42
}).subscribe({
  next: (result) => console.log('Success:', result),
  error: (error) => console.error('Error:', error),
  complete: () => console.log('Processing completed')
});
```

## Core Components

### Pipeline

The main class for sequential data processing:

```typescript
const pipeline = new Pipeline<InputType, OutputType>();
pipeline
  .addStage(new ValidationStage(...))
  .addStage(new TransformationStage(...))
  .execute(data);
```

### Stages

#### ValidationStage

Validates input data:

```typescript
new ValidationStage<T>((data: T) => boolean);
```

#### TransformationStage

Transforms data between stages:

```typescript
new TransformationStage<Input, Output>((data: Input) => Output);
```

## Advanced Usage

### Async Transformations

```typescript
const asyncPipeline = new Pipeline<number, string>();

asyncPipeline.addStage(
  new TransformationStage<number, string>(async (num) => {
    const result = await someAsyncOperation(num);
    return result.toString();
  })
);
```

### Complex Data Validation

```typescript
interface UserData {
  email: string;
  age: number;
}

const userValidation = new ValidationStage<UserData>((user) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(user.email) && user.age >= 18;
});
```

### Type Transformation Chain

```typescript
const pipeline = new Pipeline<number, string>()
  .addStage(new TransformationStage<number, number>(n => n * 2))
  .addStage(new ValidationStage<number>(n => n > 0))
  .addStage(new TransformationStage<number, string>(n => n.toString()));
```

## Error Handling

The pipeline uses RxJS error handling:

```typescript
pipeline.execute(data).subscribe({
  next: (result) => console.log('Success:', result),
  error: (error) => {
    if (error.message.includes('validation')) {
      console.error('Validation failed:', error);
    } else {
      console.error('Processing error:', error);
    }
  },
  complete: () => console.log('Pipeline completed')
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
