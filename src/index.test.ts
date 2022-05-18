import {
  createEvent,
  createIdentify,
  createPageview,
  getMeta,
  resetMeta,
} from '@posthog/plugin-scaffold/test/utils'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'

import type { VarianceConfig } from '.'
import { onEvent } from './index'

describe(`onEvent`, () => {
  enableFetchMocks()

  const config: VarianceConfig = {
    authHeader: `Basic ...`,
    webhookUrl: `https://variance.variance.dev`,
  }
  resetMeta({ config })

  afterEach(() => {
    fetchMock.resetMocks()
  })

  it(`should support $autocapture`, async () => {
    await onEvent(
      createEvent({
        event: `$autocapture`,
        properties: { amount: `20`, currency: `USD` },
      }),
      getMeta()
    )
    expect(fetchMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://variance.variance.dev",
        Object {
          "body": "{\\"libary\\":{\\"name\\":\\"@variance/posthog-plugin\\",\\"version\\":\\"0.0.0\\"},\\"context\\":{\\"ip\\":\\"127.128.129.130\\"},\\"originalTimestamp\\":\\"2020-11-26T12:58:58.453Z\\",\\"userId\\":\\"007\\",\\"type\\":\\"track\\",\\"properties\\":{\\"amount\\":\\"20\\",\\"currency\\":\\"USD\\"}}",
          "headers": Object {
            "Authorization": "Basic ...",
            "Content-Type": "application/json",
          },
          "method": "POST",
        },
      ]
    `)
  })

  it(`should support $create_alias`, async () => {
    await onEvent(createEvent({ event: `$create_alias` }), getMeta())
    expect(fetchMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://variance.variance.dev",
        Object {
          "body": "{\\"libary\\":{\\"name\\":\\"@variance/posthog-plugin\\",\\"version\\":\\"0.0.0\\"},\\"context\\":{\\"ip\\":\\"127.128.129.130\\"},\\"originalTimestamp\\":\\"2020-11-26T12:58:58.453Z\\",\\"userId\\":\\"007\\",\\"type\\":\\"alias\\"}",
          "headers": Object {
            "Authorization": "Basic ...",
            "Content-Type": "application/json",
          },
          "method": "POST",
        },
      ]
    `)
  })

  it(`should support $group`, async () => {
    await onEvent(createEvent({ event: `$group` }), getMeta())
    expect(fetchMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://variance.variance.dev",
        Object {
          "body": "{\\"libary\\":{\\"name\\":\\"@variance/posthog-plugin\\",\\"version\\":\\"0.0.0\\"},\\"context\\":{\\"ip\\":\\"127.128.129.130\\"},\\"originalTimestamp\\":\\"2020-11-26T12:58:58.453Z\\",\\"userId\\":\\"007\\",\\"type\\":\\"group\\"}",
          "headers": Object {
            "Authorization": "Basic ...",
            "Content-Type": "application/json",
          },
          "method": "POST",
        },
      ]
    `)
  })

  it(`should support $identify`, async () => {
    await onEvent(createIdentify(), getMeta())
    expect(fetchMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://variance.variance.dev",
        Object {
          "body": "{\\"libary\\":{\\"name\\":\\"@variance/posthog-plugin\\",\\"version\\":\\"0.0.0\\"},\\"context\\":{\\"ip\\":\\"127.128.129.130\\",\\"traits\\":{\\"$os\\":\\"Mac OS X\\",\\"email\\":\\"test@posthog.com\\",\\"$browser\\":\\"Chrome\\",\\"$browser_version\\":86,\\"$initial_referrer\\":\\"$direct\\",\\"$initial_referring_domain\\":\\"$direct\\"}},\\"originalTimestamp\\":\\"2020-11-26T12:58:58.453Z\\",\\"userId\\":\\"007\\",\\"type\\":\\"identify\\",\\"traits\\":{\\"$os\\":\\"Mac OS X\\",\\"email\\":\\"test@posthog.com\\",\\"$browser\\":\\"Chrome\\",\\"$browser_version\\":86,\\"$initial_referrer\\":\\"$direct\\",\\"$initial_referring_domain\\":\\"$direct\\"}}",
          "headers": Object {
            "Authorization": "Basic ...",
            "Content-Type": "application/json",
          },
          "method": "POST",
        },
      ]
    `)
  })

  it(`should support $pageview`, async () => {
    await onEvent(createPageview(), getMeta())
    expect(fetchMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "https://variance.variance.dev",
        Object {
          "body": "{\\"libary\\":{\\"name\\":\\"@variance/posthog-plugin\\",\\"version\\":\\"0.0.0\\"},\\"anonymousId\\":\\"17554768afe5cb-0fc915d2a583cf-166f6152-1ea000-175543686ffdc5\\",\\"context\\":{\\"active_feature_flags\\":[\\"navigation-1775\\",\\"session-recording-player\\"],\\"app\\":{\\"version\\":\\"1.17.0\\"},\\"browser\\":\\"Chrome\\",\\"browser_version\\":86,\\"has_slack_webhook\\":false,\\"ip\\":\\"127.128.129.130\\",\\"library\\":{\\"name\\":\\"web\\",\\"version\\":\\"1.7.0-beta.1\\"},\\"os\\":{\\"name\\":\\"Mac OS X\\"},\\"page\\":{\\"host\\":\\"localhost:8000\\",\\"initial_referrer\\":\\"$direct\\",\\"initial_referring_domain\\":\\"$direct\\",\\"path\\":\\"/instance/status\\",\\"url\\":\\"http://localhost:8000/instance/status\\"},\\"posthog_version\\":\\"1.17.0\\",\\"screen\\":{\\"height\\":1120,\\"width\\":1790},\\"token\\":\\"mre13a_SMBv9EwHAtdtTyutyy6AfO00OTPwaalaHPGgKLS\\"},\\"originalTimestamp\\":\\"2020-11-26T12:58:58.453Z\\",\\"userId\\":\\"007\\",\\"type\\":\\"page\\",\\"properties\\":{\\"host\\":\\"localhost:8000\\",\\"initial_referrer\\":\\"$direct\\",\\"initial_referring_domain\\":\\"$direct\\",\\"path\\":\\"/instance/status\\",\\"url\\":\\"http://localhost:8000/instance/status\\",\\"token\\":\\"mre13a_SMBv9EwHAtdtTyutyy6AfO00OTPwaalaHPGgKLS\\",\\"distinct_id\\":\\"scbbAqF7uyrMmamV4QBzcA1rrm9wHNISdFweZz-mQ0\\",\\"posthog_version\\":\\"1.17.0\\",\\"has_slack_webhook\\":false}}",
          "headers": Object {
            "Authorization": "Basic ...",
            "Content-Type": "application/json",
          },
          "method": "POST",
        },
      ]
    `)
  })
})
