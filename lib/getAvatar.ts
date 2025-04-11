const getAvatar = async (user: any, size?: number, extention?: 'png' | 'jpeg' | 'webp' | 'gif') =>
  user.avatar
    ? await (await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extention || 'png'}?size=${size || 128}`)).arrayBuffer()
    : getDefaultAvatar(user.id)

export const getDefaultAvatar = async (id: string) =>
  await (await fetch(`https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> BigInt(22)) % BigInt(6))}.png`)).arrayBuffer()

export default getAvatar
