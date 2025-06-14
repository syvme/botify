import FormData from 'form-data'
import { instagramGetUrl } from 'instagram-url-direct'

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

  setImmediate(async () => {
    const result = await instagramGetUrl(link)
    if (!result) return await i.reply({ content: 'There was an error, probably an invalid link.' })
    const media = result.media_details

    if (!media || media.length < 1) {
      console.error(result)
      return await i.reply({ content: 'There was an unexpected error.' })
    }

    const files = await Promise.all(
      media.slice(0, 10).map(async (item) => {
        const res = await fetch(item.url)
        return {
          buffer: Buffer.from(await res.arrayBuffer()),
          filename: `processed.${item.type === 'video' ? 'mp4' : 'png'}`,
          contentType: item.type === 'video' ? 'video/mp4' : 'image/png',
        }
      })
    )

    const formData = new FormData()
    formData.append('payload_json', JSON.stringify({ type: 4, data }))
    files.forEach((file, idx) => {
      formData.append(`files[${idx}]`, file.buffer, {
        filename: file.filename,
        contentType: file.contentType,
      })
    })

    return await i.reply(formData.getBuffer(), formData.getHeaders())
  })

  return { type: 5 }
}
