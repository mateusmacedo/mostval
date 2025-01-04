import { Result } from '@mostval/common'
import { ValueObject } from '@mostval/ddd'
import { Pipeline } from '@mostval/pipeline'
import { Inject, Injectable } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'

export const PIPELINE_SYMBOL = Symbol('PIPELINE')

export class DataItem {
  message: string
}

export class DataItemValueObject extends ValueObject<DataItem> {
  constructor(value: DataItem) {
    super(value)
  }
}

@Injectable()
export class AppService {
  constructor(@Inject(PIPELINE_SYMBOL) private readonly pipeline: Pipeline) {}
  async execute(data: DataItem): Promise<Result<DataItem, Error>> {
    const dataItem = new DataItemValueObject(data)
    try {
      const executed = await lastValueFrom(this.pipeline.execute(dataItem))
      const result = Result.Ok(executed)
      return result as Result<DataItem, Error>
    } catch (error) {
      return Result.Err(error)
    }
  }
}
