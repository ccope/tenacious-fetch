import {fetch} from 'whatwg-fetch'
import retryingFetch from './retrying-fetch'

let browserFetch = false

if (window && window.fetch && ('signal' in new window.Request(''))) {
  browserFetch = window.fetch
} else {
  browserFetch = fetch
}

async function tenaciousFetch(url = '', config = {}) {

  config = Object.assign({
    factor: 1,
    retries: 0,
    retryDelay: undefined,
    retryMinDelay: 1000,
    retryMaxDelay: Infinity,
    retryStatus: [],
    fetcher: browserFetch,
    abortTimeout: undefined,
    totalTimeLimit: undefined
  }, config)

  if (!config.fetcher || typeof config.fetcher !== 'function') {
    throw new Error(
      'tenacious-fetch: No fetch implementation found. Provide a valid fetch implementation via the fetcher configuration property.'
    )
  }

  if (typeof config.onFailedAttempt != 'function') {
    config.onFailedAttempt = () => {}
  }
  if (typeof config.retryStatus === 'string' || typeof config.retryStatus === 'number') {
    config.retryStatus = [Number.parseInt(config.retryStatus)]
  }
  if (config.retryDelay) {
    config.retryMinDelay = config.retryDelay
    delete config.retryDelay
  }

  const start_time = performance.now()
  return retryingFetch(config.retries, url, config, start_time)
}
export default tenaciousFetch
