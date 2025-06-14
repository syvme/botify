import FormData from 'form-data'

const image = async (i: any, imageData: Buffer | ArrayBuffer, imageName: string, data?: any) => {
  const formData = new FormData()
  formData.append('payload_json', JSON.stringify({ type: 4, data }))
  formData.append('files[0]', Buffer.isBuffer(imageData) ? imageData : Buffer.from(imageData), { filename: imageName, contentType: 'image/png' })

  await i.reply(formData.getBuffer(), formData.getHeaders())
}

export default image
