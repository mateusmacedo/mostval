import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService, DataItem, DataItemValueObject, PIPELINE_SYMBOL } from './app.service'
import { Pipeline, TransformationStage } from '@mostval/pipeline'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, { provide: PIPELINE_SYMBOL, useFactory: () => {
    const capitalizeStage = new TransformationStage<DataItemValueObject, DataItem>((data: DataItemValueObject) => ({
      message: data.value.message.toUpperCase()
    }))
    return new Pipeline().addStage(capitalizeStage)
  } }],
})
export class AppModule {}
