import getAvatar from '@/lib/getAvatar'
import { after } from 'next/server'
import sharp from 'sharp'

export const data = {
  name: 'shito',
  description: 'shit on someone',
  options: [
    {
      type: 6,
      name: 'shitee',
      description: 'the other end of the shit exchange',
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

export const command = async (i: any) => {
  let user = i.data.resolved.users[i.data.options[0].value]

  if (user.id === process.env.MASTER_ID) user = i.user || i.member.user

  const avatar = await getAvatar(user, 56)
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

  after(() => i.reply({ files: [{ data: finalImage, name: `SPOILER_shito-${user.id}.png` }] }))
  return { type: 5 }
}
