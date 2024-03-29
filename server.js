try {
  require("dotenv").config();
} catch (err) {
  console.log('[WARN] No .env file found');
}

const throng = require("throng");
const getApp = require("./app");

const port = process.env.PORT || 3000;

throng({
  workers: 2,
  master: () => {
    console.log("Starting master process");
  },
  start: async (id) => {
    const app = await getApp();
    app.listen(port, () => console.log(`Worker ${id} listening on port ${port}`))
  }
});
