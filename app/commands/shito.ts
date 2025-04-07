import sharp from 'sharp'
import { image } from '@/lib/image'

export const data = {
  name: 'shito',
  description: 'shit on somebody',
  options: [
    {
      type: 6,
      name: 'somebody',
      description: "who you're shitting on",
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

export const command = async (i: any) => {
  const user = i.data.resolved.users[i.data.options[0].value]

  const avatar = await (await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=56`)).arrayBuffer()
  const one_6ez = await (await fetch(`${process.env.BASE_URL}/one_6ez.png`)).arrayBuffer()
  const finalImage = await sharp(Buffer.from(one_6ez))
    .composite([
      {
        input: await sharp(Buffer.from(avatar))
          .composite([
            {
              input: Buffer.from('<svg><rect x="0" y="0" width="56" height="56" rx="50" ry="50"/></svg>'),
              blend: 'dest-in',
            },
          ])
          .toBuffer(),
        top: 140,
        left: 93,
      },
    ])
    .toBuffer()

  return await image(i, finalImage, `SPOILER_shito-${user.id}.png`)
}
