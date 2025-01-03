import express from 'express'
import { AppService } from './app.service'
import { createPipeline } from './pipeline.config'

const host = process.env['HOST'] ?? 'localhost'
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000

const app = express()
const pipeline = createPipeline()
const appService = new AppService(pipeline)

app.get('/', async (req, res) => {
  const result = await appService.getData()
  res.send(result)
})

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`)
})
