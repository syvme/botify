import { instagramGetUrl } from 'instagram-url-direct'
import { after } from 'next/server'

export const data = {
  name: 'insta',
  description: 'get a video or multiple images (10 max) from anywhere on instagram',
  options: [
    {
      type: 3,
      name: 'link',
      description: 'paste the link here',
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

export const command = async (i: any) => {
  const link = i.data.options[0].value

  after(async () => {
    const result = await instagramGetUrl(link).catch(() => i.reply({ content: 'Provided link is invalid.' }))
    const media = result.media_details
    if (!media) return

    const files = await Promise.all(
      media.slice(0, 10).map(async (item: any) => {
        const res = await fetch(item.url)
        const arrayBuffer = await res.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        if (buffer.length > 8 * 1024 * 1024) return { url: item.url, isLarge: true }
        return { data: buffer, name: `processed.${item.type === 'video' ? 'mp4' : 'png'}`, isLarge: false }
      })
    )

    const attachments = files.filter((file) => !file.isLarge).map(({ data, name }) => ({ data, name }))
    console.log(attachments)
    return attachments.length === 0
      ? await i.reply({
          content: files
            .filter((file) => file.isLarge)
            .map((file) => `[${result.post_info.caption || result.post_info.owner_username}](${file.url})`)
            .join('\n'),
        })
      : await i.reply({ attachments })
  })

  return { type: 5 }
}
