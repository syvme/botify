export const data = {
  name: 'heartrate',
  description: "check my heartrate in real time (unless i'm not wearing my watch)",
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

export const command = async () => {
  const res = await fetch('https://dev.pulsoid.net/api/v1/data/heart_rate/latest', {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.PULSOID_TOKEN}` },
  }).then((r) => r.json())

  return {
    type: 4,
    data: {
      content:
        Date.now() - res.measured_at > 10 * 1000
          ? "syvme isn't wearing his heartrate monitor"
          : `syvme's heartrate is at ${res.data.heart_rate} bpm`,
    },
  }
}
