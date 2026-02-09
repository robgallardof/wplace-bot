import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const build = await Bun.build({
  entrypoints: ['./src/bot.ts'],
  // sourcemap: 'inline',
  target: 'browser',
})
for (const log of build.logs) console.log(log)
let content = await build.outputs[0]!.text()
content = content.replace('export {', '{')
const scriptHeader = readFileSync('./script.txt').toString()
const version =
  scriptHeader.match(/@version\s+([^\s]+)/)?.[1]?.trim() ?? '0.0.0'
const userScript = scriptHeader + content
writeFileSync('dist.user.js', userScript)

const extensionDir = join('dist', 'extension')
mkdirSync(extensionDir, { recursive: true })
writeFileSync(join(extensionDir, 'content.js'), content)
writeFileSync(
  join(extensionDir, 'manifest.json'),
  JSON.stringify(
    {
      manifest_version: 2,
      name: 'WPlace Bot',
      version,
      description: 'Bot to automate painting on website https://wplace.live',
      browser_action: {},
      browser_specific_settings: {
        gecko: {
          id: 'wplace-bot@local',
          strict_min_version: '109.0',
        },
      },
      content_scripts: [
        {
          matches: ['*://*.wplace.live/*'],
          js: ['content.js'],
          run_at: 'document_start',
        },
      ],
    },
    null,
    2,
  ),
)

const zipPath = join('dist', 'wplace-bot-firefox.zip')
const zipProcess = Bun.spawn(['zip', '-r', zipPath, '.'], {
  cwd: extensionDir,
})
await zipProcess.exited
