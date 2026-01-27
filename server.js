import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import apiRouter from './src/routes/api-router.js';

import { getEntryPage } from './src/utils/entry-point.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send(getEntryPage());
});

app.use('/api', apiRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: err.toString()
    });
});