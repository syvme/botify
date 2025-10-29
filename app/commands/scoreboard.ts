import { waitUntil } from '@vercel/functions'

export const data = {
  name: 'scoreboard',
  description: 'Scoreboard! Scoreboard! Aww what happened to your friend?',
  options: [
    {
      type: 1,
      name: 'add',
      description: "Increase a veteran's score by 1",
      options: [
        {
          type: 6,
          name: 'veteran',
          description: 'Select the veteran you want their score increased',
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: 'subtract',
      description: "Decrease a veteran's score by 1",
      options: [
        {
          type: 6,
          name: 'veteran',
          description: 'Select the veteran you want their score reduced',
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: 'view',
      description: 'See the scoreboard',
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const scoreboardurl = `https://discord.com/api/v10/channels/${process.env.DISCORD_SCOREBOARD_CHANNEL}/messages/${process.env.DISCORD_SCOREBOARD_MESSAGE}`

export const command = async (i: any) => {
  const scoreboard = await fetch(scoreboardurl, { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }).then((r) => r.json())
  const subcommand = i.data.options[0].name

  const scores: Record<string, number> = {}
  for (const line of scoreboard.content.split('\n')) {
    const [id, score] = line.trim().split(' ')
    if (id && score) scores[id] = Number(score)
  }

  if (subcommand !== 'view') {
    const veteran = i.data.resolved.users[i.data.options[0].options[0].value]
    const deferred = async () => {
      if (!(veteran.id in scores)) scores[veteran.id] = 0
      if (subcommand === 'add') scores[veteran.id]++
      else if (subcommand === 'subtract') scores[veteran.id]--

      await fetch(scoreboardurl, {
        method: 'PATCH',
        headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: Object.entries(scores)
            .filter(([_, score]) => score > 0)
            .map(([id, score]) => `${id} ${Math.min(score, 100)}`)
            .join('\n'),
        }),
      })
    }

    waitUntil(deferred())

    return {
      type: 4,
      data: {
        content:
          scores[veteran.id] < 1
            ? `${veteran.username} was removed from the scoreboard.`
            : scores[veteran.id] > 100
            ? `${veteran.username} has the maximum score.`
            : `${veteran.username} is now at ${scores[veteran.id]}.`,
      },
    }
  }

  return {
    type: 4,
    data: {
      embeds: [
        {
          title: 'Scoreboard',
          fields: [
            {
              name: 'Veterans',
              value: Object.keys(scores)
                .map((id) => `<@${id}>`)
                .join('\n'),
              inline: true,
            },
            {
              name: 'Scores',
              value: Object.values(scores).join('\n'),
              inline: true,
            },
          ],
          image: Math.random() < 0.067 ? { url: `${process.env.BASE_URL}/scoreboard.gif` } : undefined,
        },
      ],
    },
  }
}
