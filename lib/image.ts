import FormData from 'form-data'

export const image = async (i: any, imageData: Buffer | ArrayBuffer, imageName: string, data?: any) => {
  const formData = new FormData()
  formData.append('payload_json', JSON.stringify({ type: 4, data }))
  formData.append('files[0]', Buffer.isBuffer(imageData) ? imageData : Buffer.from(imageData), { filename: imageName, contentType: 'image/png' })

  await fetch(`https://discord.com/api/v10/interactions/${i.id}/${i.token}/callback`, {
    method: 'POST',
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, ...formData.getHeaders() },
    body: formData.getBuffer(),
  })

  return { message: 'Interaction response sent successfully' }
}
