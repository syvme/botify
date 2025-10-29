import { get } from '@vercel/edge-config'
import { verifyKey } from 'discord-interactions'
import FormData from 'form-data'
import { after } from 'next/server'
import * as insta from './commands/insta'
import * as marry from './commands/marry'
import * as promotion from './commands/promotion'
import * as scoreboard from './commands/scoreboard'
import * as shito from './commands/shito'

const commands = [insta, marry, promotion, scoreboard, shito]

export const POST = async (req: Request) => {
  const signature = req.headers.get('x-signature-ed25519')
  const timestamp = req.headers.get('x-signature-timestamp')
  const body = await req.text()
  const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!))
  if (!isValidRequest) return Response.json({ message: 'Bad request signature.' }, { status: 401 })
  const config = (await get('botify')) as { [key: string]: any }
  config.checkpoint.push(process.env.MASTER_ID)
  const i = JSON.parse(body)

  if (i.type === 2) {
    i.reply = async (content: string | { files: { data: Buffer | ArrayBuffer; name: string }[]; data?: any }, headers?: HeadersInit) => {
      const isImage = typeof content === 'object' && content.files && Array.isArray(content.files)
      if (!isImage && content.constructor !== Object) return new Error('Invalid Content Type')
      const formData = new FormData()

      if (isImage) {
        formData.append('payload_json', JSON.stringify({ type: 4, data: content.data }))
        content.files.forEach((image, idx: number) => {
          const extMatch = image.name?.match(/\.(\w+)$/)
          formData.append(`files[${idx}]`, Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data), {
            filename: image.name || `image-${idx}.png`,
            contentType: `image/${extMatch ? extMatch[1] : 'png'}`,
          })
        })
      }

      const initHeaders = isImage ? { ...formData.getHeaders(), ...headers } : { 'content-type': 'application/json', ...headers }
      return await fetch(`https://discord.com/api/v10/webhooks/${i.application_id}/${i.token}`, {
        method: 'POST',
        headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, ...initHeaders },
        body: isImage ? new Blob([new Uint8Array(formData.getBuffer())]) : JSON.stringify(content),
      }).then((r) => r.json())
    }

    if (!config.checkpoint.includes(i.user?.id || i.member.user.id)) {
      after(async () => i.reply({ files: [{ data: await (await fetch(`${process.env.BASE_URL}/8mn8l3.png`)).arrayBuffer(), name: '8mn8l3.png' }] }))
      return Response.json({ type: 5, data: { flags: 1 << 6 } })
    }
  }

  if (i.type === 1) return Response.json({ type: 1 })
  const response = await (commands as any)
    .filter(
      (command: any) =>
        (i.type === 3 ? i.data.custom_id.split('-')[0] : i.type === 5 ? i.message.interaction.name : i.data.name) === command.data.name
    )[0]
    [i.type === 3 ? 'button' : i.type === 4 ? 'autocomplete' : i.type === 5 ? 'modal' : 'command'](i)

  return response ? Response.json(response) : new Response(null, { status: 204 })
}

export const PATCH = async (req: Request) => {
  if (req.headers.get('authorization') !== process.env.CONFIG_AUTH) return Response.json({ message: 'Unauthorized' }, { status: 401 })
  return await fetch(`https://discord.com/api/v10/applications/${process.env.DISCORD_APPLICATION_ID}/commands`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
    method: 'PUT',
    body: JSON.stringify(commands.reduce<any[]>((acc, { data }) => [...acc, ...(Array.isArray(data) ? data : [data])], [])),
  }).then(async (response) => {
    if (response.ok) console.log('Registered all commands')
    else {
      let errorText = `Error registering commands\n${response.url}: ${response.status} ${response.statusText}`
      await response
        .text()
        .then((error) => error && (errorText = `${errorText}\n${error}`))
        .catch((error) => console.error('Error reading body from request:', error))
      console.error(errorText)
    }
    return response.ok ? Response.json({ message: 'Registered all commands' }) : Response.json({ message: 'There was an error' }, { status: 400 })
  })
}

export const GET = () => Response.json({ app_id: process.env.DISCORD_APPLICATION_ID, message: 'syvme is king. syvme is life.' })
