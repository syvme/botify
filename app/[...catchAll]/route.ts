const h = () => Response.json({ message: 'Not Found' }, { status: 404 })

export { h as DELETE, h as GET, h as OPTIONS, h as PATCH, h as POST, h as PUT }
