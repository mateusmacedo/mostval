import { Result } from '@mostval/common'
import { Pipeline } from '@mostval/pipeline'
import { lastValueFrom } from 'rxjs'

export interface DataItem {
  message: string
}

export class AppService {
  constructor(private readonly pipeline: Pipeline) {}

  async getData(): Promise<Result<DataItem, Error>> {
    const pResult = await lastValueFrom(this.pipeline.execute<DataItem, DataItem>({ message: 'Hello API' }))
    return Result.Ok(pResult)
  }
}