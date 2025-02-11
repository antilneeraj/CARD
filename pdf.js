const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const csvParser = require("csv-parser");

const DATA_FILE = "data.csv"; // Update this with your CSV file
const OUTPUT_DIR = "generated_pdfs";
const TRACK_FILE = "last_processed.json";

// Sample company details object
const companies = {
  "Digicommerce Solution": {
    name: "Digicommerce Solution",
    waitingRoom: 101,
    logo: "./assets/comp/digicommerce.png",
  },
  "Tech mahindra": {
    name: "Tech mahindra",
    waitingRoom: 102,
    logo: "./assets/comp/techmahindra.png",
  },
  Genpact: {
    name: "Genpact",
    waitingRoom: 102,
    logo: "./assets/comp/genpact.png",
  },
  "iEnergizer Limited": {
    name: "iEnergizer Limited",
    waitingRoom: 102,
    logo: "./assets/comp/ienergizer.png",
  },
  "Ocube Services": {
    name: "Ocube Services",
    waitingRoom: 102,
    logo: "./assets/comp/ocube.png",
  },
  "Muthoot Finance": {
    name: "Muthoot Finance",
    waitingRoom: 102,
    logo: "./assets/comp/muthootfinance.png",
  },
  "HDB Finance": {
    name: "HDB Finance",
    waitingRoom: 102,
    logo: "./assets/comp/hdbfinance.png",
  },
  Swiggy: {
    name: "Swiggy",
    waitingRoom: 102,
    logo: "./assets/comp/swiggy.png",
  },
  "Niva bupa insurance": {
    name: "Niva bupa insurance",
    waitingRoom: 102,
    logo: "./assets/comp/nivabupa.png",
  },
  "Quess Corp Limited": {
    name: "Quess Corp Limited",
    waitingRoom: 102,
    logo: "./assets/comp/quess.png",
  },
  "Cogent E Services": {
    name: "Cogent E Services",
    waitingRoom: 102,
    logo: "./assets/comp/cogent.png",
  },
  Miniso: {
    name: "Miniso",
    waitingRoom: 102,
    logo: "./assets/comp/gigroup.png",
  },
  "GI Group": {
    name: "GI Group",
    waitingRoom: 102,
    logo: "./assets/comp/gigroup.png",
  },
  "Team Lease": {
    name: "Team Lease",
    waitingRoom: 102,
    logo: "./assets/comp/teamlease.png",
  },
  "Solair X Energy": {
    name: "Solair X Energy",
    waitingRoom: 102,
    logo: "./assets/comp/solair.png",
  },
  Exwindoor: {
    name: "Exwindoor",
    waitingRoom: 102,
    logo: "./assets/comp/exwindoor.png",
  },
  "SBI Life Insurance": {
    name: "SBI Life Insurance",
    waitingRoom: 102,
    logo: "./assets/comp/sbilife.png",
  },
  "Pukhraj Health Care": {
    name: "Pukhraj Health Care",
    waitingRoom: 102,
    logo: "./assets/comp/pukhraj.png",
  },
  "Bharti Associates": {
    name: "Bharti Associates",
    waitingRoom: 102,
    logo: "",
  },
  "TruWorth Healthcare": {
    name: "TruWorth Healthcare",
    waitingRoom: 102,
    logo: "./assets/comp/truworth.png",
  },
};

// Function to read tracking file
function getLastProcessed() {
  if (fs.existsSync(TRACK_FILE)) {
    return JSON.parse(fs.readFileSync(TRACK_FILE, "utf8"));
  }
  return { lastId: 0 };
}

// Function to update tracking file
function updateLastProcessed(lastId) {
  fs.writeFileSync(TRACK_FILE, JSON.stringify({ lastId }, null, 2));
}

// Function to generate ticket HTML
function generateTicketHTML(data, company) {
  return `
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
      background: url("/assets/Lines.png") no-repeat;
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

<body>
  <div class="ticket">
    <div class="logos">
      <div style="height: 43px;aspect-ratio: 43/39; width: 39px;border-radius: 50%;"><img src="/assets/md.svg"
          alt="mdu" /></div>
      <div class="header">${company.name}</div>
      <div style="height: 43px; width: 39px;border-radius: 50%;"><img src="/assets/niit.svg" alt="niit" /></div>
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
      <img id="logo" src="${company.logo}" style="aspect-ratio: 84/31;width: 252px;height: 93px;flex-shrink: 0;"
        alt="companylogo">
    </div>
  </div>
  <p style="border: solid+1px#000;border-style: dashed;margin:8px 0; width: 100%;"></p>
</body>

</html>`;
}

// Function to generate PDF
async function generatePDF(html, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: outputPath, format: "A4" });
  await browser.close();
}

// Process CSV file
async function processCSV() {
  const lastProcessed = getLastProcessed();
  const data = [];

  fs.createReadStream(DATA_FILE)
    .pipe(csvParser())
    .on("data", (row) => {
      if (parseInt(row["S.No"]) > lastProcessed.lastId) {
        data.push(row);
      }
    })
    .on("end", async () => {
      for (const row of data) {
        const companiesApplied = row["Companies"]
          .split(",")
          .map((c) => c.trim());
        const userDir = path.join(
          OUTPUT_DIR,
          row["Name"].charAt(0).toUpperCase()
        );
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let ticketNo = 1;
        for (const companyName of companiesApplied) {
          if (companies[companyName]) {
            const data = {
              sno: row["S.No"],
              name: row["Name"],
              email: row["Email ID"],
              rollno: row["Roll No"],
              course: row["Course"],
              college: row["College"],
              ticketNo,
            }
            const ticketHTML = generateTicketHTML(row, companies[companyName]);
            const pdfPath = path.join(
              userDir,
              `${row["S.No"]}_${row["Name"]}_T${ticketNo}.pdf`
            );
            await generatePDF(ticketHTML, pdfPath);
            ticketNo++;
          }
        }
        updateLastProcessed(parseInt(row["S.No"]));
      }
      console.log("PDF Generation Completed!");
    });
}

processCSV();
