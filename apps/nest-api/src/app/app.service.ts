import { Result } from '@mostval/common'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getData(): Result<{ message: string }, Error> {
    const result = Result.Ok({ message: 'Hello API' })
    return result
  }
}
