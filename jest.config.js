/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    NAME: '@variance/posthog-plugin',
    VERSION: '0.0.0',
  },
}

export default config
