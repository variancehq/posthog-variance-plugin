import type { Meta, PluginEvent } from '@posthog/plugin-scaffold'
import get from 'lodash.get'
import set from 'lodash.set'

export interface VarianceConfig {
  authHeader: string
  webhookUrl: string
}

type Mapping = Record<string, string[] | string>

const alias: Mapping = {
  previousId: `properties.distinct_id`,
  userId: `properties.alias`,
}

const page: Mapping = {
  'name': `properties.name`,
  'properties.category': `properties.category`,
  'properties.host': `properties.$host`,
  'properties.initial_referrer': `properties.$initial_referrer`,
  'properties.initial_referring_domain': `properties.$initial_referring_domain`,
  'properties.path': `properties.$pathname`,
  'properties.referrer': `properties.$referrer`,
  'properties.referring_domain': `properties.$referring_domain`,
  'properties.url': `properties.$current_url`,
}

const identify: Mapping = {
  'context.traits': `$set`,
  'traits': `$set`,
}

const group: Mapping = {
  groupId: `groupId`,
  traits: `traits`,
}

const track: Mapping = {
  event: `event`,
}

const generic: Mapping = {
  'anonymousId': [
    `properties.$anon_distinct_id`,
    `properties.$device_id`,
    `properties.distinct_id`,
  ],
  'context.active_feature_flags': `properties.$active_feature_flags`,
  'context.app.version': `properties.posthog_version`,
  'context.browser': `properties.$browser`,
  'context.browser_version': `properties.$browser_version`,
  'context.has_slack_webhook': `properties.has_slack_webhook`,
  'context.ip': `ip`,
  'context.library.name': `properties.$lib`,
  'context.library.version': `properties.$lib_version`,
  'context.os.name': `properties.$os`,
  'context.page.host': `properties.$host`,
  'context.page.initial_referrer': `properties.$initial_referrer`,
  'context.page.initial_referring_domain': `properties.$initial_referring_domain`,
  'context.page.path': `properties.$pathname`,
  'context.page.referrer': `properties.$referrer`,
  'context.page.referring_domain': `properties.$referring_domain`,
  'context.page.url': `properties.$current_url`,
  'context.posthog_version': `properties.posthog_version`,
  'context.screen.height': `properties.$screen_height`,
  'context.screen.width': `properties.$screen_width`,
  'context.token': `properties.token`,
  'messageId': `$insert_id`,
  'originalTimestamp': `sent_at`,
  'userId': [`$user_id`, `distinct_id`],
}

const autoCapture: Mapping = {
  'event': `properties.$event_type`,
  'properties.elements': `properties.$elements`,
}

const eventToMapping = {
  $autocapture: { mapping: autoCapture, type: `track` },
  $create_alias: { mapping: alias, type: `alias` },
  $group: { mapping: group, type: `group` },
  $identify: { mapping: identify, type: `identify` },
  $page: { mapping: page, type: `page` },
  $pageview: { mapping: page, type: `page` },
  default: { mapping: track, type: `track` },
}

export async function onEvent(
  event: PluginEvent,
  { config }: Meta<{ config: VarianceConfig }>
) {
  const variancePayload = {
    libary: {
      name: NAME,
      version: VERSION,
    },
  }
  constructPayload(variancePayload, event, generic)

  const eventName = get(event, `event`)
  const { type, mapping } =
    eventName in eventToMapping
      ? eventToMapping[eventName as keyof typeof eventToMapping]
      : eventToMapping.default

  set(variancePayload, `type`, type)
  constructPayload(variancePayload, event, mapping)

  const properties = event.properties
  if (properties) {
    Object.keys(properties).forEach((propKey) => {
      if (
        propKey.slice(0, 1) !== `$` &&
        properties[propKey] !== undefined &&
        properties[propKey] !== null
      ) {
        set(variancePayload, `properties.${propKey}`, properties[propKey])
      }
    })
  }

  return send(variancePayload, config)
}

function constructPayload(
  outPayload: Record<string, unknown>,
  inPayload: PluginEvent,
  mapping: Mapping
) {
  Object.keys(mapping).forEach((varianceKeyPath) => {
    const pHKeyPath = mapping[varianceKeyPath]
    let pHKeyVal = undefined
    if (Array.isArray(pHKeyPath)) {
      for (let i = 0; i < pHKeyPath.length; i++) {
        pHKeyVal = get(inPayload, pHKeyPath[i])
        if (pHKeyVal) {
          break
        }
      }
    } else {
      pHKeyVal = get(inPayload, pHKeyPath)
    }
    if (pHKeyVal !== undefined && pHKeyVal !== null) {
      set(outPayload, varianceKeyPath, pHKeyVal)
    }
  })
}

async function send(payload: Record<string, unknown>, config: VarianceConfig) {
  await fetch(config.webhookUrl, {
    body: JSON.stringify(payload),
    headers: {
      'Authorization': config.authHeader,
      'Content-Type': `application/json`,
    },
    method: `POST`,
  })
}
