import express from "express";
import cors from "cors";
import itemsRouter from "./routes/routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/items", itemsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
