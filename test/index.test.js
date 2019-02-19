const fetch = require('node-fetch');
import tenaciousFetch from '../src/index';

const baseURL = `http://localhost:${global.PORT}`

test('should export function', () => {
  expect(tenaciousFetch).toBeDefined()
})

test('should perform GET request', async () => {
  const res = await tenaciousFetch(`${baseURL}/name`, {
    fetcher: fetch
  })
  expect(res.status).toBe(200)
})

test('should perform POST request', async () => {
  const res = await tenaciousFetch(`${baseURL}/name`, {

    fetcher: fetch,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({success: true})
  })
  expect(res.status).toBe(200)
})

test('should retry if request fails with 500', async () => {
  const fn = jest.fn()
  const res = await tenaciousFetch(`${baseURL}/retries`, {
    fetcher: fetch,
    retries: 3,
    //retryDelay: 100,
    retryStatus: [500],
    onFailedAttempt: fn
  })
  expect(res.status).toBe(200)
  expect(fn).toHaveBeenCalledTimes(2) // last attempt succeeds
})

test('should use incremental backoff if factor provided', async () => {
  let start = performance.now()
  const res = await tenaciousFetch(`${baseURL}/retries`, {
    fetcher: fetch,
    retryDelay: 200,
    retries: 2, // doesn't count the initial try, setup.js succeeds on 3rd try
    factor: 10,
    retryStatus: [500]
  })
  let end = performance.now()
  let duration = end - start
  expect(res.status).toBe(200)
  expect(duration).toBeGreaterThan(200+2000)
})

test('should perform GET request with timeout', async () => {
  const fn = jest.fn()
  const res = await tenaciousFetch(`${baseURL}/name`, {
    fetcher: fetch,
    retryDelay: 50,
    retries: 3,
    retryStatus: [500],
    abortTimeout: 250,
    onFailedAttempt: fn
  })
  expect(res.status).toBe(200)
  expect(fn).toHaveBeenCalledTimes(0)
})

test('should timeout for long request', async () => {
  const fn = jest.fn()
  expect.assertions(4)
  let start = performance.now()
  try {
    await tenaciousFetch(`${baseURL}/timeout`, {
      fetcher: fetch,
      retryDelay: 50,
      retries: 3,
      retryStatus: [500],
      abortTimeout: 250,
      onFailedAttempt: fn
    })
  } catch (e) { expect(e.name).toEqual('AbortError') }
  let end = performance.now()
  let duration = end - start
  expect(fn).toHaveBeenCalledTimes(4)
  expect(duration).not.toBeLessThan(1100)
  expect(duration).not.toBeGreaterThan(1490)
})

test('should let requests block if no timeout', async () => {
  const fn = jest.fn()
  let start = performance.now()
  expect(await tenaciousFetch(`${baseURL}/timeout2`, {
    fetcher: fetch,
    retryDelay: 50,
    retries: 1,
    retryStatus: [500],
    onFailedAttempt: fn
  }))
  let end = performance.now()
  let duration = end - start
  expect(duration).not.toBeLessThan(100)
  expect(fn).toHaveBeenCalledTimes(0)
})

test('should timeout after total time limit exceeded', async () => {
  let start = performance.now()
  try {
    expect(await tenaciousFetch(`${baseURL}/timeout`, {
      fetcher: fetch,
      factor: 2,
      retryMinDelay: 10,
      retryMaxDelay: 200,
      abortTimeout: 150,
      totalTimeLimit: 3000,
      retries: 30,
      retryStatus: [500]
    }))
  } catch (e) { expect(e.name).toEqual('AbortError') }
  let end = performance.now()
  let duration = end - start
  expect(duration).not.toBeLessThan(3000)
  expect(duration).not.toBeGreaterThan(3300)
})

afterAll(() => {
  global.stop()
})
