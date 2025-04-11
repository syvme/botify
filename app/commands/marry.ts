import sharp from 'sharp'
import getAvatar from '@/lib/getAvatar'
import image from '@/lib/image'

export const data = {
  name: 'marry',
  description: 'marry somebody',
  options: [
    {
      type: 6,
      name: 'bride',
      description: 'choose the lucky one',
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

export const command = async (i: any) => {
  const groom = i.user || i.member.user
  const bride = i.data.resolved.users[i.data.options[0].value]

  if (groom.id === bride.id) return { type: 4, data: { content: "You can't marry yourself.", flags: 64 } }
  const wedding = await (await fetch(`${process.env.BASE_URL}/wedding.png`)).arrayBuffer()

  const finalImage = await sharp(Buffer.from(wedding))
    .composite([
      {
        input: await sharp(Buffer.from(await getAvatar(bride, 80)))
          .composite([
            {
              input: Buffer.from('<svg><rect x="0" y="0" width="80" height="80" rx="50" ry="50"/></svg>'),
              blend: 'dest-in',
            },
          ])
          .toBuffer(),
        top: 45,
        left: 230,
      },
      {
        input: await sharp(Buffer.from(await getAvatar(groom, 80)))
          .composite([
            {
              input: Buffer.from('<svg><rect x="0" y="0" width="80" height="80" rx="50" ry="50"/></svg>'),
              blend: 'dest-in',
            },
          ])
          .toBuffer(),
        top: 35,
        left: 325,
      },
    ])
    .toBuffer()

  return await image(i, finalImage, `WEDDING-${groom.id}.png`)
}
