import { Message, IMeta, IPayload } from './message'

interface ITestPayload extends IPayload<string> {
  value: string
}
interface ITestMeta extends IMeta<string> {
  createdBy: string
}

class TestMessage extends Message<ITestPayload, ITestMeta> {}

describe('Message', () => {
  it('should be able to create a message', () => {
    const payload: ITestPayload = { value: 'test@example.com' }
    const metadata: ITestMeta = {
      createdBy: 'admin',
      timestamp: Date.now().toString(),
      id: '1',
      schema: 'user',
      type: 'new',
    }

    const message = new TestMessage(payload, metadata)
    expect(message).toBeDefined()
  })

  it('should be able to get the payload', () => {
    const payload: ITestPayload = { value: 'test@example.com' }
    const metadata: ITestMeta = {
      createdBy: 'admin',
      timestamp: Date.now().toString(),
      id: '1',
      schema: 'user',
      type: 'new',
    }

    const message = new TestMessage(payload, metadata)
    expect(message.payload).toBeDefined()
    expect(message.payload).toEqual(payload)
  })

  it('should be able to get the metadata', () => {
    const payload: ITestPayload = { value: 'test@example.com' }
    const metadata: ITestMeta = {
      createdBy: 'admin',
      timestamp: Date.now().toString(),
      id: '1',
      schema: 'user',
      type: 'new',
    }

    const message = new TestMessage(payload, metadata)
    expect(message.metadata).toBeDefined()
    expect(message.metadata).toEqual(metadata)
  })
})
