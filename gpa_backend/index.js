const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const port = 3000;
const db = require("./models/")
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended : false }))

app.use(fileUpload({
    limits : { fileSize: 50 * 1024 * 1024 }
}))

let corsOptions = {
    origin : ['http://localhost:5173', 'http://127.0.0.1:5173'],
 }

 app.use(cors(corsOptions))
 app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

db.sequelizeInst.sync({}).then(() => {
    console.log("Database Ready for the action")
}).catch((err) => {
    console.error("The Database is dead and we killed it...", err)
})

require("./routes")(app)

app.listen(port, () => {
    console.log(`API started at http://localhost:${port}`)
})