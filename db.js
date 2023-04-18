const mongoose = require('mongoose');

const uri = "mongodb+srv://ranushmithila:ypV9WRLk9oCjHwVL@cluster0.cmuyetg.mongodb.net/ChatApp?retryWrites=true&w=majority";
// ypV9WRLk9oCjHwVL

//connect to mogoDB
async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
    }
}

connectDB();