const util = require("util");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { spawn } = require("child_process");
const axios = require("axios");
const validations = require("../../helper/validations");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY)
  throw new Error("Missing GROQ_API_KEY in environment variables");

const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

console.log("extractTextFromPDF ", extractTextFromPDF);

const extractTextFromDocx = async (filePath) => {
  const data = await mammoth.extractRawText({ path: filePath });
  return data.value;
};

const isValidResume = async (text) => {
  if (!text || text.split(/\s+/).length < 400) return false;

  const sections = [
    "work experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "summary",
    "objective",
  ];
  const sectionMatches = sections.filter((section) =>
    new RegExp(section, "i").test(text)
  );

  const contactInfoRegex = /(phone|email|linkedin|github|@\S+|\+?\d[\d -]+)/i;
  const hasContactInfo = contactInfoRegex.test(text);

  return new Promise((resolve, reject) => {
    const python = spawn("python3", ["./ner.py", text]);
    let output = "";

    python.stdout.on("data", (data) => (output += data.toString()));
    python.stderr.on("data", (err) =>
      console.error("Python error:", err.toString())
    );

    python.on("close", () => {
      try {
        const entities = JSON.parse(output);
        const required = ["PERSON", "ORG", "GPE", "DATE"];
        const found = required.filter((r) => entities.includes(r));
        resolve(
          sectionMatches.length >= 4 && hasContactInfo && found.length >= 4
        );
      } catch (err) {
        reject(err);
      }
    });
  });
};

console.log("isValidResume ", isValidResume);

const generateResumeAnalysis = async (resumeText) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3-70b-8192",
        messages: [
          {
            role: "user",
            content: `Analyze this resume:\n${resumeText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error?.response?.data || error.message);
    return "Error analyzing resume.";
  }
};
console.log(" generateResumeAnalysis", generateResumeAnalysis);

const upload_resume = async (req, res) => {
  const file = req.file;

  console.log("File received:", req.file);

  try {
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const ext = path.extname(file.originalname).toLowerCase();
    if (![".pdf", ".docx"].includes(ext)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const resumeText =
      ext === ".pdf"
        ? await extractTextFromPDF(file.path)
        : await extractTextFromDocx(file.path);

    fs.unlinkSync(file.path); // cleanup

    const valid = await isValidResume(resumeText);
    if (!valid)
      return res.status(400).json({ message: "Invalid or incomplete resume" });

    const analysis = await generateResumeAnalysis(resumeText);
    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("Error in upload_resume:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
};

module.exports = { upload_resume };
