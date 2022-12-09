import mongoose from "mongoose";
import app from "./app";
import config from "./config/index";

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("DB connected");

    app.on("error", (err) => {
      console.log("Error = ", err);
      throw err;
    });

    const onListening = () => {
      console.log(`Listening on ${config.PORT}`);
    };

    app.listen(config.PORT, onListening);
  } catch (error) {
    console.log("ERROR ", err);
    throw err;
  }
})();
