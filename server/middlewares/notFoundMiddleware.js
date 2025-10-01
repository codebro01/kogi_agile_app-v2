export const notFound = (req, res) => {
    console.log(req.url)
    return res.status(404).json('Route does not Exist')
}
