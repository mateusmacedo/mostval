import { Stage } from '../../lib/pipeline';
import { BotInputData } from './pipeline-dummy-bot';

export interface ColumnSearch {
  readonly value: string;
  readonly regex: string;
}

export interface QueryColumn {
  readonly data: string;
  readonly name: string;
  readonly searchable: string;
  readonly orderable: string;
  readonly search: ColumnSearch;
}

export interface Query {
  readonly draw: string;
  readonly columns: Array<QueryColumn>;
  readonly start: number;
  readonly length: string;
  readonly search: ColumnSearch;
  readonly pesquisaLivre: string;
  readonly numeroProcesso: string;
  readonly orgaoJulgador: string;
  readonly relator: string;
  readonly dataIni: string;
  readonly dataFim: string;
  readonly _: string;
}

export interface ExtractedData {
  codigoDocumento: string;
  numeroProcesso: string;
  relator: string;
  classeJudicial: string;
  orgaoJulgador: string;
  dataAssinatura: string;
  dataJulgamento: string;
  texto: string;
  resumo: string;
  orgao: string;
}

export class DataExtractorResult {
  constructor(
    readonly draw: number,
    readonly recordsTotal: number,
    readonly recordsFiltered: number,
    readonly data: Array<ExtractedData>,
    readonly error: string | null,
    readonly criteria: string
  ) {}
}

export class DataExtractorStage<TInput extends BotInputData, TOutput extends DataExtractorResult> implements Stage<TInput, TOutput> {
  name = 'DataExtractorStage';

  async execute(data: TInput): Promise<TOutput> {
    if (!(data instanceof BotInputData)) {
      throw new Error('Invalid data type');
    }

    const query: Query = {
      draw: '1',
      columns: [
        {
          data: 'codigoDocumento',
          name: '',
          searchable: 'true',
          orderable: 'false',
          search: {
            value: '',
            regex: 'false'
          }
        }
      ],
      start: (data.value.page - 1) * 10,
      length: '10',
      search: {
        value: '',
        regex: 'false'
      },
      pesquisaLivre: '',
      numeroProcesso: '',
      orgaoJulgador: '',
      relator: '',
      dataIni: data.value.date.split('-').reverse().join('/'),
      dataFim: data.value.date.split('-').reverse().join('/'),
      _: '1733319357220'
    }

    const BASE_URL = 'https://juliapesquisa.trf5.jus.br/julia-pesquisa/api/v1/documento:dt/G2?';

    const queryString = this.encodeNested(query)

    const response = await fetch(`${BASE_URL}${queryString}`)
    const result = await response.json()
    return new DataExtractorResult(result.draw, result.recordsTotal, result.recordsFiltered, result.data, result.error, result.criteria) as TOutput
  }


  private encodeNested(obj: Query, prefix = ''): string {
    return Object.entries(obj)
      .map(([key, value]) => {
        const fullKey = prefix ? `${prefix}[${key}]` : key

        if (typeof value === 'object' && !Array.isArray(value)) {
          return this.encodeNested(value, fullKey)
        } else if (Array.isArray(value)) {
          return value
            .map((item, index) => this.encodeNested(item, `${fullKey}[${index}]`))
            .join('&')
        } else {
          return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`
        }
      })
      .join('&')
  }
}
