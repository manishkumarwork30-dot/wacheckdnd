// Deprecated: Redis has been replaced with MongoDB.
// Dummy client and exports kept for backward compatibility and test mocks.

export async function initializeRedis(): Promise<any> {
  return {} as any;
}

export function createSubscriberClient(): any {
  return {} as any;
}

const redis: any = {};
export default redis;
