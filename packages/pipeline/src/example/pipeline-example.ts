import { Pipeline } from '../lib/pipeline';
import { TransformationStage } from '../lib/stages/transformation-stage';
import { ValidationStage } from '../lib/stages/validation-stage';


interface DataItem {
  id: string;
  value: number;
}

function main(): void {
    const pipeline = new Pipeline()
        .addStage(new ValidationStage<DataItem>((data: DataItem) => data.value > 0))
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
}

main();
