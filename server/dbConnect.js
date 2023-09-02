const mongoose = require("mongoose");

module.exports = async () => {
    const mongoUri =
        "mongodb+srv://yadavdipesh331:Dipesh123@cluster0.tw9sgao.mongodb.net/?retryWrites=true&w=majority";

    try {
        const connect = await mongoose.connect(mongoUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
    } catch (error) {
        process.exit(1);
    }
};