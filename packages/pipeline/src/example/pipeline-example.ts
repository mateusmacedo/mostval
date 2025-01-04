import { Pipeline } from '../lib/pipeline';
import { TransformationStage } from '../lib/stages/transformation-stage';
import { ValidationStage } from '../lib/stages/validation-stage';


interface DataItem {
  id: string;
  value: number;
}

function main(): void {
    const pipeline = new Pipeline<DataItem, DataItem>()
        .addStage(new ValidationStage<DataItem, DataItem>([{
            validate: async (data: DataItem) =>
                data.value > 0 ? [] : ['Value must be positive']
        }]))
        .addStage(new TransformationStage<DataItem, DataItem>((data: DataItem) => ({
            ...data,
            value: data.value * 2
        })));

    const inputData: DataItem = {
        id: '123',
        value: 42
    };

    pipeline.execute(inputData).subscribe({
        next: (result) => console.log('Resultado:', result),
        error: (error) => console.error('Erro:', error),
        complete: () => console.log('Processamento completo')
    });

    const errorPipeline = new Pipeline<DataItem, DataItem>()
        .addStage(new ValidationStage<DataItem, DataItem>([{
            validate: async (data: DataItem) =>
                data.value > 0 ? [] : ['Value must be positive']
        }]))
        .addStage(new TransformationStage<DataItem, DataItem>((data: DataItem) => ({
            ...data,
            value: data.value * 2
        })));

    const errorInputData: DataItem = {
        id: '123',
        value: -42
    };

    errorPipeline.execute(errorInputData).subscribe({
        next: (result) => console.log('Resultado:', result),
        error: (error) => console.error('Erro:', error),
        complete: () => console.log('Processamento completo')
    });
}

main();
