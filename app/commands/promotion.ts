export const data = {
  name: 'promotion',
  description: 'checks whether a discord promotion code is usable or not',
  options: [
    {
      type: 3,
      name: 'code',
      description: "the discord promotion code you'd like to validate",
      required: true,
      min_length: 24,
      max_length: 64,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

export const command = async (i: any) => {
  const code = i.data.options[0].value.replace(/(https?:\/\/)?(discord\.com\/billing\/promotions\/|promos\.discord\.gg\/)([\w\d]+)/g, '$3')

  if (!/^[a-zA-Z0-9]+$/.test(code)) return { type: 4, data: { content: 'Provided code is invalid.' } }

  return await fetch(`https://discord.com/api/v10/entitlements/gift-codes/${code}`).then(async (response) => {
    const body = await response.json()
    return {
      type: 4,
      data: {
        content: `\`${code}\` returned **${body.promotion?.inbound_header_text || body.message}**${
          body.uses && body.uses === body.max_uses ? " but it's **Redeemed**" : ''
        }`,
      },
    }
  })
}
