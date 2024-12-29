import { Result } from '@mostval/common'
import express from 'express'

const host = process.env['HOST'] ?? 'localhost'
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000

const app = express()

app.get('/', (req, res) => {
  const result = Result.Ok({ message: 'Hello API' })
  res.send(result)
})

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`)
})
