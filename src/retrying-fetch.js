/* global AbortController */
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'
try {
  const { performance } = require('perf_hooks');
} catch (e) {};
const pRetry = require('p-retry');


function retryingFetch(retries, url, config) {
  const start_time = performance.now()
  return pRetry(
    (attempt) => {
      if (config.abortTimeout || config.totalTimeLimit) {
         return timeoutRetryPromise(url, config, start_time);
      } else {
         return fetchAttempt(url, config);
    }},
    {
      onFailedAttempt: config.onFailedAttempt,
      retries: config.retries,
      factor: config.factor,
      minTimeout: config.retryMinDelay,
      maxTimeout: config.retryMaxDelay
  })
}

function timeoutRetryPromise(url, config, start_time) {
  var abortTimer;
  var controller;
  return Promise.race([
    new Promise((resolve, reject) => {
      controller = new AbortController();
      config.signal = controller.signal;
      if (config.totalTimeLimit && performance.now() - start_time > config.totalTimeLimit) {
        if (abortTimer) { clearTimer(abortTimer) }
          reject(new pRetry.AbortError(new pRetry.AbortError('Total Time Limit Exceeded')))
      };
      resolve();
    })
    .then(res => { return fetchAttempt(url, config) }),
    new Promise((resolve, reject) =>
      abortTimer = setTimeout(() => {
        controller.abort();;
        },
        config.abortTimeout || config.totalTimeLimit)
    )
  ])
}

function fetchAttempt(url, config) {
  return new Promise((resolve, reject) => {
    config.fetcher(url, config)
      .then(res => {
        if (config.retryStatus.includes(res.status)) {
            let err = new Error(res.statusText)
            reject(err)
        }
        resolve(res)
      })
      .catch(e => reject(e))
  })
}

export default retryingFetch
