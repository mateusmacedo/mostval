import { BaseMetadata, Message } from './message';
import { TFlexible } from './utility-type';

interface ITestPayload extends TFlexible<{ value: string }> {
  value: string;
}
interface ITestMeta extends TFlexible<BaseMetadata> {
  createdBy: string;
}

class TestMessage extends Message<ITestPayload, ITestMeta> {}

describe('Message', () => {
  it('should be able to create a message', () => {
    const payload: ITestPayload = { value: 'test' };
    const metadata: ITestMeta = { createdBy: 'admin' };

    const message = new TestMessage(payload, metadata);
    expect(message).toBeDefined();
  });

  it('should be able to get the payload', () => {
    const payload: ITestPayload = { value: 'test' };
    const metadata: ITestMeta = { createdBy: 'admin' };

    const message = new TestMessage(payload, metadata);
    expect(message.payload).toBeDefined();
    expect(message.payload).toEqual(payload);
  });

  it('should be able to get the metadata', () => {
    const payload: ITestPayload = { value: 'test' };
    const metadata: ITestMeta = { createdBy: 'admin' };

    const message = new TestMessage(payload, metadata);
    expect(message.metadata).toBeDefined();
    expect(message.metadata).toEqual(metadata);
  });
});
