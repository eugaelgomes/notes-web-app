module.exports = (req, res, next) => {
  if (!req.client.authorized) {
    return res.status(401).send("Security certificate invalid");
  }
  next();
};
