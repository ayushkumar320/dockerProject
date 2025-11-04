import controlRouter from './routes/route.js';
import express, {type Express} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app: Express = express();
const port: number =  3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", controlRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

