const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const csvParser = require("csv-parser");

const DATA_FILE = "data.csv"; // Update this with your CSV file
const OUTPUT_DIR = path.join(__dirname, "pdfs");
const TRACK_FILE = "last_processed.json";

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sample company details object
const companies = {
  "Digicommerce Solution": {
    name: "Digicommerce Solution",
    waitingRoom: "SF16",
    logo: "comp/digicommerce.png",
    ticketSeries: 1143,
  },
  "Tech mahindra": {
    name: "Tech mahindra",
    waitingRoom: "SF15",
    logo: "comp/techmahindra.png",
    ticketSeries: 2497,
  },
  Genpact: {
    name: "Genpact",
    waitingRoom: "SF24",
    logo: "comp/genpact.png",
    ticketSeries: 3262,
  },
  "iEnergizer Limited": {
    name: "iEnergizer Limited",
    waitingRoom: "FF14",
    logo: "comp/ienergizer.png",
    ticketSeries: 4263,
  },
  "Ocube Services": {
    name: "Ocube Services",
    waitingRoom: "FF12",
    logo: "comp/ocube.png",
    ticketSeries: 5021,
  },
  "Muthoot Finance": {
    name: "Muthoot Finance",
    waitingRoom: "GF02",
    logo: "comp/muthootfinance.png",
    ticketSeries: 6146,
  },
  "HDB Finance": {
    name: "HDB Finance",
    waitingRoom: "SF18",
    logo: "comp/hdbfinance.png",
    ticketSeries: 7091,
  },
  Swiggy: {
    name: "Swiggy",
    waitingRoom: "FF06",
    logo: "comp/swiggy.png",
    ticketSeries: 8221,
  },
  "Niva bupa insurance": {
    name: "Niva bupa insurance",
    waitingRoom: "SF19",
    logo: "comp/nivabupa.png",
    ticketSeries: 9034,
  },
  "Quess Corp Limited": {
    name: "Quess Corp Limited",
    waitingRoom: "FF10",
    logo: "comp/quess.png",
    ticketSeries: 10140,
  },
  "Cogent E Services": {
    name: "Cogent E Services",
    waitingRoom: "SF20",
    logo: "comp/cogent.png",
    ticketSeries: 11070,
  },
  Miniso: {
    name: "Miniso",
    waitingRoom: "FF07",
    logo: "comp/miniso.png",
    ticketSeries: 12223,
  },
  "GI Group": {
    name: "GI Group",
    waitingRoom: "GF05",
    logo: "comp/gigroup.png",
    ticketSeries: 13043,
  },
  "Team Lease": {
    name: "Team Lease",
    waitingRoom: "SF17",
    logo: "comp/teamlease.png",
    ticketSeries: 14149,
  },
  "Solair X Energy": {
    name: "Solair X Energy",
    waitingRoom: "SF25",
    logo: "comp/solair.png",
    ticketSeries: 15161,
  },
  Exwindoor: {
    name: "Exwindoor",
    waitingRoom: "SF21",
    logo: "comp/exwindoor.png",
    ticketSeries: 16052,
  },
  "SBI Life Insurance": {
    name: "SBI Life Insurance",
    waitingRoom: "FF13",
    logo: "comp/sbilife.png",
    ticketSeries: 17152,
  },
  "Pukhraj Health Care": {
    name: "Pukhraj Health Care",
    waitingRoom: "SF22",
    logo: "comp/pukhraj.png",
    ticketSeries: 18170,
  },
  "Bharti Associates": {
    name: "Bharti Associates",
    waitingRoom: "FF11",
    logo: "comp/bharti.png",
    ticketSeries: 19016,
  },
  "TruWorth Healthcare": {
    name: "TruWorth Healthcare",
    waitingRoom: "SF23",
    logo: "comp/truworth.png",
    ticketSeries: 20034,
  },
};

// Function to read tracking file
function getLastProcessed() {
  try {
    if (fs.existsSync(TRACK_FILE)) {
      return JSON.parse(fs.readFileSync(TRACK_FILE, "utf8"));
    }
  } catch (error) {
    console.error("Error reading tracking file:", error);
  }
  return { lastId: 0 };
}

// Function to update tracking file
function updateLastProcessed(lastId) {
  try {
    fs.writeFileSync(TRACK_FILE, JSON.stringify({ lastId }, null, 2));
  } catch (error) {
    console.error("Error updating tracking file:", error);
  }
}

// Function to convert image file to base64
function getBase64FromFile(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString("base64");
}
const bgvector = getBase64FromFile(path.join(__dirname, "assets", "Lines.png"));

// Function to generate ticket HTML
async function generateTicketHTML(data, company, count, applied) {
  const logoBase64 = getBase64FromFile(
    path.join(__dirname, "assets", company.logo)
  );
  const mduLogoBase64 = getBase64FromFile(
    path.join(__dirname, "assets", "md.svg")
  );
  const niitLogoBase64 = getBase64FromFile(
    path.join(__dirname, "assets", "niit.svg")
  );

  return `
<div class="ticket">
  <div class="logos">
    <div style="height: 43px;aspect-ratio: 43/39; width: 39px;border-radius: 50%;">
      <img src="data:image/svg+xml;base64,${mduLogoBase64}" alt="mdu" />
    </div>
    <div class="header">${company.name}</div>
    <div style="height: 43px; width: 39px;border-radius: 50%;">
      <img src="data:image/svg+xml;base64,${niitLogoBase64}" alt="niit" />
    </div>
  </div>
  <div class="flexbetween" style="margin-top: 20px;">
    <div class="details">
      <div class="flexrow">
        <span class="underline">S No.</span>
        <span class="alignleft" id="S.No">${data.sno}</span>
      </div>
      <div class="flexrow">
        <span class="underline">Name</span>
        <span class="alignleft" id="Name">${data.name}</span>
      </div>
      <div class="flexrow">
        <span class="underline">Email ID</span>
        <span class="alignleft" id="Email ID">${data.email}</span>
      </div>
      <div class="flexrow">
        <span class="underline">Roll No</span>
        <span class="alignleft" id="Roll No">${data.rollno}</span>
      </div>
      <div class="flexrow">
        <span class="underline">Course</span>
        <span class="alignleft" id="Course">${data.course}</span>
      </div>
      <div class="flexrow">
        <span class="underline">College</span>
        <span class="alignleft" id="College">${data.college}</span>
      </div>
    </div>
    <div>
      <span class="underline">Waiting Room No.</span>
      <span class="alignleft" id="waiting">&nbsp;&nbsp;${
        company.waitingRoom
      }</span>
    </div>
  </div>
  <div>
    <div class="abpos">
      <span class="underline-dupli">Ticket No.</span>
      <span class="alignleft" id="ticket">&nbsp;&nbsp;${data.ticketNo}</span>
    </div>
  </div>
  <div style="position:absolute;padding:20px 0;bottom:0;right: 20px;">
    <img id="logo" src="data:image/png;base64,${logoBase64}" style="aspect-ratio: 84/31;width: 200px;height: 70px;flex-shrink: 0;" alt="companylogo">
  </div>
</div>
    ${
      count < applied.length
        ? `<p style="margin:8px 0; width: 100%; height: 1px; background: repeating-linear-gradient(to right, black, black 10px, transparent 10px, transparent 15px);"></p>`
        : ``
    }
`;
}

// Function to generate PDF
async function generatePDF(html, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");
  await page.pdf({
    path: outputPath,
    format: "A4",
    scale: 1.35,
    pageRanges: "1",
    printBackground: true,
  });
  await browser.close();
}

const CSV_OUTPUT_DIR = path.join(__dirname, "csv");

// Ensure the CSV output directory exists
if (!fs.existsSync(CSV_OUTPUT_DIR)) {
  fs.mkdirSync(CSV_OUTPUT_DIR, { recursive: true });
}

// Function to escape and quote CSV values
function escapeCsvValue(value) {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  // If the value contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
  if (
    stringValue.includes('"') ||
    stringValue.includes(",") ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// Function to create company CSV files
function writeCompanyCSV(companyName, studentData) {
  const safeCompanyName = companyName.replace(/\s+/g, "_");
  const csvPath = path.join(CSV_OUTPUT_DIR, `${safeCompanyName}.csv`);

  // CSV headers
  const headers = [
    "S.No",
    "Name",
    "Email ID",
    "Roll No",
    "Course",
    "College",
    "Ticket No",
  ];

  // Create CSV content
  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...studentData.map((row) =>
      [
        row.sno,
        row.name,
        row.email,
        row.rollno,
        row.course,
        row.college,
        row.ticketNo,
      ]
        .map(escapeCsvValue)
        .join(",")
    ),
  ].join("\n");

  fs.writeFileSync(csvPath, csvContent);
  console.log(`CSV generated for ${companyName}:`, csvPath);
}

// Process CSV file
async function processCSV() {

  const lastProcessed = getLastProcessed();
  const data = [];
  let pdfCount = 0;
  let serialNo = 1001;

  // Create object to store company-wise student data
  const companyData = {};

  fs.createReadStream(DATA_FILE)
    .pipe(csvParser())
    .on("data", (row) => {
      const sno = parseInt(row["S.No"]);
      // if (sno > lastProcessed.lastId) {
        data.push(row);
      // }
    })
    .on("end", async () => {
      console.log("CSV processing completed. Rows to process:", data.length);
      for (const row of data) {
        const companiesApplied = row["Companies Applied To"]
          .split(",")
          .map((c) => c.trim())
          .slice(0, 3);

        const userDir = path.join(
          OUTPUT_DIR,
          row["Name"].charAt(0).toUpperCase()
        );
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let combinedHTML = `
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      padding: 0;
      box-sizing: border-box;
    }

    body {
      display: flex;
      flex-flow: column;
      justify-content: start;
      align-items: center;
      height: 100vh;
      font-family: "Plus Jakarta Sans", "Roboto", "Montserrat";
      background: url("data:image/png;base64,${bgvector}") no-repeat;
    }

    .ticket {
      width: 522px;
      height: 256px;
      border: solid+2px#000;
      padding: 20px;
      border-radius: 20px;
      position: relative;
    }

    .header {
      width: fit-content;
      font-size: 22px;
      font-weight: light;
    }

    .logos {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
    }

    .logos> :nth-child(3) {
      justify-self: end;
      margin-right: 50px;
    }

    .logos> :nth-child(2) {
      justify-self: center;
    }

    .details {
      display: flex;
      flex-flow: column;
      gap: 8px;
    }

    .details div {
      line-height: normal;
    }

    .underline {
      text-align: right;
      text-decoration-line: underline;
      text-transform: uppercase;
      font-size: 8px;
      width: 54px;
      font-weight: 300;
      line-height: normal;
      text-decoration-style: solid;
      text-decoration-skip-ink: auto;
      text-underline-offset: 0.5px;
      text-underline-position: from-font;
    }
          .underline-dupli {
      text-align: right;
      text-transform: uppercase;
      font-size: 8px;
      width: 54px;
      font-weight: 300;
      line-height: normal;
      text-decoration-style: solid;
      text-decoration-skip-ink: auto;
      text-underline-position: from-font;
    }

    .alignleft {
      text-align: left;
      font-size: 12px;
      font-weight: 400;
      width: 200px;
      line-height: 1.2;
    }

    .flexbetween {
      display: flex;
      justify-content: space-between;
    }

    .flexrow {
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
    }

    .abpos {
      position: absolute;
      bottom: 0;
      right: 18px;
    }
  </style>
  <title>Card</title>
</head>

<body>`;
        let count = 0;
        for (const companyName of companiesApplied) {
          if (companies[companyName]) {
            const company = companies[companyName];
            const ticketNo = company.ticketSeries++;
            const ticketData = {
              sno: serialNo,
              name: row["Name"],
              email: row["Email ID"],
              rollno: row["Roll No"],
              course: row["Course"],
              college: row["College"],
              ticketNo,
            };
            count++;
            combinedHTML += await generateTicketHTML(
              ticketData,
              company,
              count,
              companiesApplied
            );

            if (!companyData[companyName]) {
              companyData[companyName] = [];
            }

            companyData[companyName].push({
              sno: serialNo,
              name: row["Name"],
              email: row["Email ID"],
              rollno: row["Roll No"],
              course: row["Course"],
              college: row["College"],
              ticketNo,
            });
          } else {
            console.log("Company not found:", companyName);
          }
        }

        combinedHTML += `
</body>
</html>`;

        const safeName = row["Name"].trim().replace(/\s+/g, "_");
        const safeRollNo = (() => {
          const rollNo = row["Roll No"].trim();
          try {
            return BigInt(rollNo).toString();
          } catch {
            return rollNo.replace(/[^\w]+/g, "_");
          }
        })();
        const pdfPath = path.join(
          userDir,
          `${serialNo}_${safeName}_${safeRollNo}.pdf`
        );
        try {
          // await generatePDF(combinedHTML, pdfPath);
          pdfCount++;
          console.log("PDF generated:", pdfPath);
        } catch (error) {
          console.error("Error generating PDF:", error);
        }

        serialNo++;
        updateLastProcessed(serialNo);
      }

      // Generate CSV files for each company
      for (const [companyName, students] of Object.entries(companyData)) {
        writeCompanyCSV(companyName, students);
      }

      console.log(
        `PDF Generation Completed! Total PDFs generated: ${pdfCount}`
      );
      console.log(
        `CSV files generated for ${Object.keys(companyData).length} companies`
      );
    })
    .on("error", (error) => {
      console.error("Error processing CSV file:", error);
    });
}

processCSV();
