const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const csvParser = require("csv-parser");
const axios = require("axios");

const DATA_FILE = "candidates.csv"; // Update this with your CSV file
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
    ticketSeries: 1000,
  },
  "Tech mahindra": {
    name: "Tech mahindra",
    waitingRoom: "SF15",
    logo: "comp/techmahindra.png",
    ticketSeries: 2000,
  },
  Genpact: {
    name: "Genpact",
    waitingRoom: "SF24",
    logo: "comp/genpact.png",
    ticketSeries: 3000,
  },
  "iEnergizer Limited": {
    name: "iEnergizer Limited",
    waitingRoom: "FF14",
    logo: "comp/ienergizer.png",
    ticketSeries: 4000,
  },
  "Ocube Services": {
    name: "Ocube Services",
    waitingRoom: "FF12",
    logo: "comp/ocube.png",
    ticketSeries: 5000,
  },
  "Muthoot Finance": {
    name: "Muthoot Finance",
    waitingRoom: "GF02",
    logo: "comp/muthootfinance.png",
    ticketSeries: 6000,
  },
  "HDB Finance": {
    name: "HDB Finance",
    waitingRoom: "SF18",
    logo: "comp/hdbfinance.png",
    ticketSeries: 7000,
  },
  Swiggy: {
    name: "Swiggy",
    waitingRoom: "FF06",
    logo: "comp/swiggy.png",
    ticketSeries: 8000,
  },
  "Niva bupa insurance": {
    name: "Niva bupa insurance",
    waitingRoom: "SF19",
    logo: "comp/nivabupa.png",
    ticketSeries: 9000,
  },
  "Quess Corp Limited": {
    name: "Quess Corp Limited",
    waitingRoom: "FF10",
    logo: "comp/quess.png",
    ticketSeries: 10000,
  },
  "Cogent E Services": {
    name: "Cogent E Services",
    waitingRoom: "SF20",
    logo: "comp/cogent.png",
    ticketSeries: 11000,
  },
  Miniso: {
    name: "Miniso",
    waitingRoom: "FF07",
    logo: "comp/gigroup.png",
    ticketSeries: 12000,
  },
  "GI Group": {
    name: "GI Group",
    waitingRoom: "GF05",
    logo: "comp/gigroup.png",
    ticketSeries: 13000,
  },
  "Team Lease": {
    name: "Team Lease",
    waitingRoom: "SF17",
    logo: "comp/teamlease.png",
    ticketSeries: 14000,
  },
  "Solair X Energy": {
    name: "Solair X Energy",
    waitingRoom: "SF25",
    logo: "comp/solair.png",
    ticketSeries: 15000,
  },
  Exwindoor: {
    name: "Exwindoor",
    waitingRoom: "SF21",
    logo: "comp/exwindoor.png",
    ticketSeries: 16000,
  },
  "SBI Life Insurance": {
    name: "SBI Life Insurance",
    waitingRoom: "FF13",
    logo: "comp/sbilife.png",
    ticketSeries: 17000,
  },
  "Pukhraj Health Care": {
    name: "Pukhraj Health Care",
    waitingRoom: "SF22",
    logo: "comp/pukhraj.png",
    ticketSeries: 18000,
  },
  "Bharti Associates": {
    name: "Bharti Associates",
    waitingRoom: "FF11",
    logo: "",
    ticketSeries: 19000,
  },
  "TruWorth Healthcare": {
    name: "TruWorth Healthcare",
    waitingRoom: "SF23",
    logo: "comp/truworth.png",
    ticketSeries: 20000,
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

// Function to generate ticket HTML
async function generateTicketHTML(data, company) {
  const logoBase64 = getBase64FromFile(path.join(__dirname, "assets", company.logo));
  const mduLogoBase64 = getBase64FromFile(path.join(__dirname, "assets", "md.svg"));
  const niitLogoBase64 = getBase64FromFile(path.join(__dirname, "assets", "niit.svg"));

  return `
<div class="ticket">
  <div class="logos">
    <div style="height: 43px;aspect-ratio: 43/39; width: 39px;border-radius: 50%;"><img src="data:image/svg+xml;base64,${mduLogoBase64}"
        alt="mdu" /></div>
    <div class="header">${company.name}</div>
    <div style="height: 43px; width: 39px;border-radius: 50%;"><img src="data:image/svg+xml;base64,${niitLogoBase64}" alt="niit" /></div>
  </div>
  <div class="flexbetween" style="margin-top: 20px;">
    <div class="details">
      <div class="flexrow"><span class="underline">S No.</span><span class="alignleft" id="S.No">${data.sno}</span></div>
      <div class="flexrow"><span class="underline">Name</span><span class="alignleft" id="Name">${data.name}</span></div>
      <div class="flexrow">
        <span class="underline">Email ID</span><span class="alignleft" id="Email ID">${data.email}</span>
      </div>
      <div class="flexrow"><span class="underline">Roll No</span><span class="alignleft" id="Roll No">${data.rollno}</span></div>
      <div class="flexrow">
        <span class="underline">Course</span><span class="alignleft" id="Course">${data.course}</span>
      </div>
      <div class="flexrow"><span class="underline">College</span><span class="alignleft" id="College">${data.college}</span></div>
    </div>
    <div><span class="underline">Waiting Room No.</span><span class="alignleft" id="waiting">${company.waitingRoom}</span></div>
  </div>
  <div>
    <div class="abpos"><span class="underline">Ticket No.</span><span class="alignleft" id="ticket">${data.ticketNo}</span></div>
  </div>
  <div style="position:absolute;padding:20px 0;bottom:0;right: 20px;">
    <img id="logo" src="data:image/png;base64,${logoBase64}" style="aspect-ratio: 84/31;width: 252px;height: 93px;flex-shrink: 0;"
      alt="companylogo">
  </div>
</div>
<p style="border: solid+1px#000;border-style: dashed;margin:8px 0; width: 100%;"></p>`;
}

// Function to generate PDF
async function generatePDF(html, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");
  await page.pdf({ path: outputPath, format: "A4", scale: 1.35 });
  await browser.close();
}

// Process CSV file
async function processCSV() {
  const lastProcessed = getLastProcessed();
  const data = [];
  let pdfCount = 0;
  let serialNo = 1;

  fs.createReadStream(DATA_FILE)
    .pipe(csvParser())
    .on("data", (row) => {
      const sno = parseInt(row["S.No"]);
      //       if (sno > lastProcessed.lastId) {
      data.push(row);
      //       }
    })
    .on("end", async () => {
      console.log("CSV processing completed. Rows to process:", data.length);
      for (const row of data) {
        const companiesApplied = row["Companies Applied To"]
          .split(",")
          .map((c) => c.trim());

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
    @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: "Plus Jakarta Sans";
      background: url("assets/Lines.png") no-repeat;
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
      text-decoration-thickness: auto;
      text-underline-offset: auto;
      text-underline-position: from-font;
    }

    .alignleft {
      text-align: left;
      font-size: 12px;
      font-weight: 400;
      width: 175px;
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
            combinedHTML += await generateTicketHTML(ticketData, company);
          } else {
            console.log("Company not found:", companyName);
          }
        }

        combinedHTML += `
</body>
</html>`;

        const pdfPath = path.join(userDir, `${row["S.No"]}_${row["Name"]}.pdf`);
        try {
          await generatePDF(combinedHTML, pdfPath);
          pdfCount++;
          console.log("PDF generated:", pdfPath);
        } catch (error) {
          console.error("Error generating PDF:", error);
        }

        serialNo++;
        updateLastProcessed(parseInt(row["S.No"]));
      }
      console.log(
        `PDF Generation Completed! Total PDFs generated: ${pdfCount}`
      );
    })
    .on("error", (error) => {
      console.error("Error processing CSV file:", error);
    });
}

processCSV();
