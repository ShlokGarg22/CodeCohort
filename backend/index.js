const express = require('express');
const mongoose = require("mongoose")
const { userRouter } = require('./routes/user');
require('dotenv').config();
const app = express();


app.use("/api/v1/user",userRouter)
app.use("/api/v1/admin",adminRouter)

async function main(){
    await mongoose.connect(process.env.MONGODB_URI);
    app.listen(5000, () => {
        console.log("Server started on port 5000");
    });
}

main().catch(err => console.error(err));