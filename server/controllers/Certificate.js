const PdfPrinter = require("pdfmake");
const path = require("path");
const User = require("../models/User");
const Course = require("../models/Course");

const fonts = {
	Roboto: {
		normal: path.join(__dirname, "../fonts/Roboto-Regular.ttf"),
		bold: path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
		italics: path.join(__dirname, "../fonts/Roboto-Italic.ttf"),
		bolditalics: path.join(__dirname, "../fonts/Roboto-BoldItalic.ttf"),
	},
};

const printer = new PdfPrinter(fonts);

exports.generateCertificate = async (req, res) => {
    const userId = req.user.id;
	try {
        
		const { courseId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(!courseId) {
            return res.status(400).json({ message: "Course ID is required" });  
        }
        const course = await Course.findById(courseId).populate("instructor");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const userName = user.firstName + " " + user.lastName;
        const courseName = course.courseName;
        const instructorName = course.instructor.firstName + " " + course.instructor.lastName;

		const currentDate = new Date().toLocaleDateString("en-GB");

		const docDefinition = {
			pageSize: { width: 842, height: 595.28 }, // Landscape A4
			pageMargins: [40, 60, 40, 60],
			background: [
				{
					image: "assets/certificateBackground.png", // or remove this line if not using
					width: 842,
					height: 595.28,
				},
			],
			content: [
				{
					image: "assets/platformLogo.png", // path to your logo image
					width: 120,
					alignment: "center",
					margin: [0, 40, 0, 20],
				},
				{
					text: "World's Largest Learning Platform",
					style: "title",
					alignment: "center",
					margin: [0, 0, 0, 20],
				},
				{
					text: "This certifies that",
					style: "subtitle",
					alignment: "center",
					margin: [0, 0, 0, 10],
				},
				{
					text: userName,
					style: "name",
					alignment: "center",
					margin: [0, 0, 0, 10],
				},
				{
					text: `has successfully completed the course titled`,
					style: "subtitle",
					alignment: "center",
					margin: [0, 0, 0, 5],
				},
				{
					text: `"${courseName}"`,
					style: "course",
					alignment: "center",
					margin: [0, 0, 0, 30],
				},
				{
					text: `Awarded on ${currentDate}`,
					style: "footer",
					alignment: "center",
					margin: [0, 0, 0, 50],
				},
				{
					columns: [
						{
							stack: [
								{
									text: currentDate,
									alignment: "center",
									margin: [0, 20, 0, 0],
								},
								{
									text: "Date of Issue",
									style: "footer",
									alignment: "center",
									margin: [0, 5, 0, 0],
								},
							],
							width: 200,
						},
						{ text: "", width: "*" },
						{
							stack: [
								{
									image: "assets/signature.png",
									width: 100,
									alignment: "center",
								},
								{
									text: "Course Director",
									alignment: "center",
									margin: [0, 5, 0, 0],
								},
								{
									text: `${instructorName}`, // Replace with dynamic value if needed
									style: "footer",
									alignment: "center",
									margin: [0, 2, 0, 0],
								},
							],
							width: 200,
						},
					],
				},
			],
			styles: {
				title: { fontSize: 26, bold: true },
				subtitle: { fontSize: 16 },
				name: { fontSize: 22, bold: true, color: "#d9822b" },
				course: { fontSize: 18, italics: true },
				footer: { fontSize: 14 },
			},
			defaultStyle: {
				font: "Roboto",
			},
		};

		const pdfDoc = printer.createPdfKitDocument(docDefinition);
		const chunks = [];

		pdfDoc.on("data", (chunk) => chunks.push(chunk));
		pdfDoc.on("end", () => {
			const pdfBuffer = Buffer.concat(chunks);

			res.set({
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="certificate-${userName}.pdf"`,
			});

			res.send(pdfBuffer);
		});

		pdfDoc.end();
	} catch (err) {
		console.error("Error generating certificate:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
