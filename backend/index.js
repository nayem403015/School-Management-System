const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
// const bodyParser = require("body-parser")
const app = express()
const Routes = require("./routes/route.js")
const Admin = require("./models/adminSchema.js")
const Student = require("./models/studentSchema.js")
const Sclass = require("./models/sclassSchema.js")
const bcrypt = require('bcrypt')

const PORT = process.env.PORT || 5000

dotenv.config();

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(express.json({ limit: '10mb' }))
app.use(cors())

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async () => {
        console.log("Connected to MongoDB")
        // Seed default admin for guest login
        let existingAdmin = await Admin.findOne({ email: "yogendra@12" });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash("zxc", salt);
            existingAdmin = new Admin({
                name: "Guest Admin",
                email: "yogendra@12",
                password: "zxc",
                role: "Admin",
                schoolName: "Guest School"
            });
            await existingAdmin.save();
            console.log("Default admin created for guest login");

            // Create a default class
            const existingClass = await Sclass.findOne({ sclassName: "1st Class", school: existingAdmin._id });
            if (!existingClass) {
                const defaultClass = new Sclass({
                    sclassName: "1st Class",
                    school: existingAdmin._id
                });
                await defaultClass.save();
                console.log("Default class created");

                // Create default student
                const existingStudent = await Student.findOne({ rollNum: 1, name: "Dipesh Awasthi" });
                if (!existingStudent) {
                    const student = new Student({
                        name: "Dipesh Awasthi",
                        rollNum: 1,
                        password: hashedPass,
                        sclassName: defaultClass._id,
                        school: existingAdmin._id,
                        role: "Student"
                    });
                    await student.save();
                    console.log("Default student created for guest login");
                }
            }
        }
    })
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.use('/', Routes);

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})