const {mailSender} = require("../utils/mailSender");

exports.contactUs = async (req, res) => {
  const { firstName, lastName, email, message, phoneNo } = req.body;
  if (!firstName || !email || !message) {
    console.log("All fields are necessary in contact us form")
    return res.status(403).send({
      success: false,
      message: "All Fields are required",
    });
  }
  try {
    const data = {
      firstName,
      lastName: `${lastName ? lastName : "null"}`,
      email,
      message,
      phoneNo: `${phoneNo ? phoneNo : "null"}`,
    };
    const info = await mailSender(
      process.env.CONTACT_MAIL,
      "Enquery",
      `<html><body>${Object.keys(data).map((key) => {
        return `<p>${key} : ${data[key]}</p>`;
      })}</body></html>`
    );
    if (info) {
      return res.status(200).send({
        success: true,
        message: "Your message has been sent successfully",
      });
    } else {
      console.log("Something went wrong - mail not sent")
      return res.status(403).send({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.log("Some error occured in contact us form: ", error.message)
    return res.status(403).send({
      success: false,
      message: "Something went wrong",
    });
  }
};
