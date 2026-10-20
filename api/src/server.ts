import { createApp } from "./app";
import { openDb } from "./db";

const port = Number(process.env.PORT) || 4000;
const db = openDb(process.env.DB_PATH);

createApp(db).listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});