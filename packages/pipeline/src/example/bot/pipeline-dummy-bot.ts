import { Pipeline } from '../../lib/pipeline';
import { TransformationStage } from '../../lib/stages/transformation-stage';
import { ValidationStage } from '../../lib/stages/validation-stage';
import { DataExtractorResult, DataExtractorStage, Query } from './stage-data-extractor';

type State = {
    date: string;
    page: number;
}

export class BotInputData {
    constructor(readonly id: string, readonly value: State) {}
}

export class TransformedData {
    constructor(
        readonly numero_processo: string,
        readonly relator: string,
        readonly classe: string,
        readonly orgao_julgador: string,
        readonly data_publicacao: string,
        readonly data_julgamento: string,
        readonly ementa: string,
        readonly resumo: string,
        readonly fonte: string
    ) {}
}

export class BotOutputData implements Query {
    draw: string;
    columns: {
        data: string;
        name: string;
        searchable: string;
        orderable: string;
        search: { value: string; regex: string; }
    }[];
    start: number;
    length: string;
    search: { value: string; regex: string; };
    pesquisaLivre: string;
    numeroProcesso: string;
    orgaoJulgador: string;
    relator: string;
    dataIni: string;
    dataFim: string;
    _: string;
    data: TransformedData[];

    constructor() {
        this.draw = '';
        this.columns = [];
        this.start = 0;
        this.length = '';
        this.search = { value: '', regex: '' };
        this.pesquisaLivre = '';
        this.numeroProcesso = '';
        this.orgaoJulgador = '';
        this.relator = '';
        this.dataIni = '';
        this.dataFim = '';
        this._ = '';
        this.data = [];
    }
}

export function dataTransformer(data: DataExtractorResult): BotOutputData {
    const output = new BotOutputData();
    output.data = data.data.map(item => ({
      numero_processo: item.numeroProcesso.replace(
        /^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,
        "$1-$2.$3.$4.$5$6"
      ),
      relator: item.relator,
      classe: item.classeJudicial,
      orgao_julgador: item.orgaoJulgador,
      data_publicacao: item.dataAssinatura,
      data_julgamento: item.dataJulgamento,
      ementa: item.texto,
      resumo: item.resumo,
      fonte: item.orgao
    }));
    return output;
}

function main() {
    const pipeline = new Pipeline()
        .addStage(new ValidationStage<BotInputData>([{
            validate: async (data: BotInputData) =>
                data.value.page > 0 ? [] : ['Page must be positive']
        }]))
        .addStage(new DataExtractorStage<BotInputData, DataExtractorResult>())
        .addStage(new TransformationStage<DataExtractorResult, BotOutputData>(dataTransformer))

    const inputData = new BotInputData('123', { date: '2021-01-01', page: 42 });

    pipeline.execute(inputData).subscribe({
        next: (result) => console.log('Resultado:', result),
        error: (error) => console.error('Erro:', error),
        complete: () => console.log('Processamento completo')
    });
}

main();