const https_redirect = [
  async (req, res) => {
    if (req.headers["x-forwarded-proto"] !== "http") {
      return res.redirect(`http://${req.headers.host}${req.url}`);
    } else {
      return res.send("Message is not ok");
    }
    next();
  },
];

module.exports = https_redirect;
