import { Result } from '@mostval/common'
import { Pipeline } from '@mostval/pipeline'
import { Inject, Injectable } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'

export const PIPELINE_SYMBOL = Symbol('PIPELINE')

export interface DataItem {
  message: string
}

@Injectable()
export class AppService {
  constructor(@Inject(PIPELINE_SYMBOL) private readonly pipeline: Pipeline) {}
  async getData(): Promise<Result<DataItem, Error>> {
    const pResult = await lastValueFrom(this.pipeline.execute<DataItem>({ message: 'Hello API' }))
    const result = Result.Ok(pResult)
    return result as Result<DataItem, Error>
  }
}
