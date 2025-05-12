const express = require("express");

const app = express();

const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");
const serviceProviderRoutes = require("./routes/ServiceProvider");
const developerRoutes = require("./routes/developer");
const instituteAdminRoutes = require("./routes/InstituteAdmin");
const hodRoutes = require("./routes/HOD");
const instructorRoutes = require("./routes/Instructor");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const studentRoutes = require("./routes/Student");
const {createServiceProvider} = require('./controllers/developer')
const quizRoutes = require('./routes/Quiz')

const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;
database.connect();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: JSON.parse(process.env.CORS_ORIGIN),
    credentials: true,
    maxAge: 14400,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudnairyconnect();

app.use("/api/v1/auth", userRoutes);

app.use("/api/v1/serviceProvider", serviceProviderRoutes);

app.use('/api/v1/developer', developerRoutes);

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use("/api/v1/course", CourseRoutes);

app.use("/api/v1/instituteAdmin", instituteAdminRoutes);

app.use("/api/v1/contact", require("./routes/ContactUs"));

app.use("/api/v1/hod", hodRoutes);

app.use("/api/v1/instructor", instructorRoutes);

app.use("/api/v1/student", studentRoutes);

app.use("/api/v1/quiz", quizRoutes);


// creating service provider

createServiceProvider(
  process.env.SERVICE_PROVIDER_FIRST_NAME,
  process.env.SERVICE_PROVIDER_LAST_NAME,
  process.env.SERVICE_PROVIDER_EMAIL,
  process.env.SERVICE_PROVIDER_PASSWORD
)

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
