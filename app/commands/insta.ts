import FormData from 'form-data'
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
        const isVideo = item.type === 'video'
        if (isVideo && buffer.length > 8 * 1024 * 1024) return { url: item.url, isLargeVideo: true }
        return {
          buffer,
          filename: `processed.${isVideo ? 'mp4' : 'png'}`,
          contentType: isVideo ? 'video/mp4' : 'image/png',
          isLargeVideo: false,
        }
      })
    )

    const formData = new FormData()
    formData.append('payload_json', JSON.stringify({ type: 4, data }))

    files.forEach(async (file, idx) => {
      if (file.isLargeVideo) return await i.reply({ content: `[${result.post_info.caption || result.post_info.owner_username}](${file.url})` })
      else formData.append(`files[${idx}]`, file.buffer, { filename: file.filename, contentType: file.contentType })
    })

    return await i.reply(formData.getBuffer(), formData.getHeaders())
  })

  return { type: 5 }
}
