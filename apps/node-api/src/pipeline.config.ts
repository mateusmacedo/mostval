import { Pipeline, TransformationStage } from '@mostval/pipeline'
import { DataItem } from './app.service'

export function createPipeline(): Pipeline<DataItem, DataItem> {
  const capitalizeStage = new TransformationStage<DataItem, DataItem>((data: DataItem) => ({
    ...data,
    message: data.message.toUpperCase()
  }))

  return new Pipeline<DataItem, DataItem>().addStage(capitalizeStage)
}