import { verifyKey } from 'discord-interactions'
import image from '@/lib/image'
import { get } from '@vercel/edge-config'
import * as marry from './commands/marry'
import * as promotion from './commands/promotion'
import * as shito from './commands/shito'

const commands = [marry, promotion, shito]

export const POST = async (req: Request) => {
  const signature = req.headers.get('x-signature-ed25519')
  const timestamp = req.headers.get('x-signature-timestamp')
  const body = await req.text()
  const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!))
  if (!isValidRequest) return Response.json({ message: 'Bad request signature.' }, { status: 401 })
  const config = (await get('botify')) as { [key: string]: any }
  const i = JSON.parse(body)

  if (i.type === 1) return Response.json({ type: 1 })
  if (i.type !== 2) return new Response(null, { status: 204 })
  if (!config.checkpoint.includes(i.user?.id || i.member.user.id))
    return Response.json(await image(i, await (await fetch(`${process.env.BASE_URL}/8mn8l3.png`)).arrayBuffer(), '8mn8l3.png', { flags: 64 }))

  return Response.json(await commands.filter((command: any) => i.data.name.toLowerCase() === command.data.name)[0].command(i))
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
    return response.ok ? Response.json({ message: 'Registered all commands' }) : Response.json({ message: 'There was an error.' }, { status: 400 })
  })
}

export const GET = () => Response.json({ app_id: process.env.DISCORD_APPLICATION_ID })
