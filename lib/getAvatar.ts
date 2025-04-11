import sharp from 'sharp'

type Extensions = 'png' | 'jpeg' | 'webp' | 'gif'

const getAvatar = async (user: any, size?: number, extention?: Extensions) =>
  user.avatar
    ? await (await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extention || 'png'}?size=${size || 128}`)).arrayBuffer()
    : getDefaultAvatar(user.id, size, extention)

export const getDefaultAvatar = async (id: string, size?: number, extention?: Extensions) => {
  const colorEquation = Number((BigInt(id) >> BigInt(22)) % BigInt(6))
  const avatar = await (await fetch(`https://cdn.discordapp.com/embed/avatars/${colorEquation}.${extention || 'png'}`)).arrayBuffer()

  if (size) {
    const resized = await sharp(Buffer.from(avatar)).resize(size).toBuffer()
    return resized.buffer.slice(resized.byteOffset, resized.byteOffset + resized.length) as ArrayBuffer
  }

  return avatar
}

export default getAvatar
