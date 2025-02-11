# import os
# import pandas as pd
# import pdfkit
# from jinja2 import Template
# import json

# # Load company details
# companies = {
#     "Genpact": {"waiting_room": "101", "logo": "/assets/comp/genpact.png", "name": "Genpact"},
#     "HDB Finance": {"waiting_room": "102", "logo": "/assets/comp/hdbfinance.png", "name": "HDB Finance"},
#     "Swiggy": {"waiting_room": "103", "logo": "/assets/comp/swiggy.png", "name": "Swiggy"},
#     "Quess Corp Limited": {"waiting_room": "104", "logo": "/assets/comp/quess.png", "name": "Quess Corp Limited"},
#     "Team Lease": {"waiting_room": "105", "logo": "/assets/comp/teamlease.png", "name": "Team Lease"},
#     "Solair X Energy": {"waiting_room": "106", "logo": "/assets/comp/solair.png", "name": "Solair X Energy"},
#     "Tech mahindra": {"waiting_room": "107", "logo": "/assets/comp/techmahindra.png", "name": "Tech mahindra"},
#     "Muthoot Finance": {"waiting_room": "108", "logo": "/assets/comp/muthootfinance.png", "name": "Muthoot Finance"},
#     "SBI Life Insurance": {"waiting_room": "109", "logo": "/assets/comp/sbilife.png", "name": "SBI Life Insurance"},
#     "Miniso": {"waiting_room": "110", "logo": "/assets/comp/miniso.png", "name": "Miniso"},
#     "Digicommerce Solution": {"waiting_room": "111", "logo": "/assets/comp/digicommerce.png", "name": "Digicommerce Solution"},
# }


# # Load last processed state
# STATE_FILE = "last_processed.json"
# if os.path.exists(STATE_FILE):
#     with open(STATE_FILE, "r") as f:
#         last_state = json.load(f)
# else:
#     last_state = {"last_candidate_id": 0, "last_ticket_id": 0}

# # Read data
# input_file = "candidates.csv"  # Change to Excel file if needed
# df = pd.read_csv(input_file)

# def generate_ticket_html(candidate, company_name, ticket_no):
#     """Generates an HTML string for a single ticket."""
#     company = companies.get(company_name, {"waiting_room": "000", "logo": "default.png", "name": company_name})
    
#     template = Template(open("index.html").read())
#     return template.render(
#         serial=candidate["S.No"],
#         name=candidate["Name"],
#         email=candidate["Email ID"],
#         roll=candidate["Roll No"],
#         course=candidate["Course"],
#         college=candidate["College"],
#         company_name=company["name"],
#         waiting_room=company["waiting_room"],
#         logo=company["logo"],
#         ticket_no=ticket_no
#     )

# def save_pdf(candidate_id, name, ticket_htmls):
#     """Saves multiple tickets as a single A4 PDF."""
#     html_content = """<html><body style='font-family: sans-serif;'>"""
#     for html in ticket_htmls:
#         html_content += html + "<hr>"
#     html_content += "</body></html>"
    
#     pdf_filename = f"{candidate_id}_{name.replace(' ', '_')}.pdf"
#     folder = name[0].upper()
#     os.makedirs(folder, exist_ok=True)
#     pdf_path = os.path.join(folder, pdf_filename)
#     pdfkit.from_string(html_content, pdf_path)
#     print(f"Saved: {pdf_path}")

# def main():
#     last_id = last_state["last_candidate_id"]
#     last_ticket = last_state["last_ticket_id"]
    
#     for _, row in df.iterrows():
#         if row["S.No"] <= last_id:
#             continue  # Skip already processed candidates
        
#         applied_companies = str(row["Companies Applied To"]).split(",")[:3]  # Max 3 tickets
#         tickets = []
        
#         for i, company in enumerate(applied_companies, start=1):
#             last_ticket += 1
#             tickets.append(generate_ticket_html(row, company.strip(), last_ticket))
        
#         save_pdf(row["S.No"], row["Name"], tickets)
#         last_id = row["S.No"]
    
#     # Save state for resumption
#     with open(STATE_FILE, "w") as f:
#         json.dump({"last_candidate_id": last_id, "last_ticket_id": last_ticket}, f)
    
#     print("Processing complete!")

# if __name__ == "__main__":
#     main()

import os
import pandas as pd
import pdfkit
from jinja2 import Template
import json

# Load company details
companies = {
    "Genpact": {"waiting_room": "101", "logo": "genpact.png", "name": "Genpact"},
    "HDB Finance": {"waiting_room": "102", "logo": "hdbfinance.png", "name": "HDB Finance"},
    "Swiggy": {"waiting_room": "103", "logo": "swiggy.png", "name": "Swiggy"},
    "Quess Corp Limited": {"waiting_room": "104", "logo": "quess.png", "name": "Quess Corp Limited"},
    "Team Lease": {"waiting_room": "105", "logo": "teamlease.png", "name": "Team Lease"},
    "Solair X Energy": {"waiting_room": "106", "logo": "solair.png", "name": "Solair X Energy"},
    "Tech mahindra": {"waiting_room": "107", "logo": "techmahindra.png", "name": "Tech mahindra"},
    "Muthoot Finance": {"waiting_room": "108", "logo": "muthootfinance.png", "name": "Muthoot Finance"},
    "SBI Life Insurance": {"waiting_room": "109", "logo": "sbilife.png", "name": "SBI Life Insurance"},
    "Miniso": {"waiting_room": "110", "logo": "miniso.png", "name": "Miniso"},
    "Digicommerce Solution": {"waiting_room": "111", "logo": "digicommerce.png", "name": "Digicommerce Solution"},
}

# Load last processed state
STATE_FILE = "last_processed.json"
if os.path.exists(STATE_FILE):
    with open(STATE_FILE, "r") as f:
        last_state = json.load(f)
else:
    last_state = {"last_candidate_id": 0, "last_ticket_id": 0}

# Read data
input_file = "candidates.csv"  # Change to Excel file if needed
df = pd.read_csv(input_file)

def generate_ticket_html(candidate, company_name, ticket_no):
    """Generates an HTML string for a single ticket."""
    company = companies.get(company_name, {"waiting_room": "000", "logo": "default.png", "name": company_name})
    
    # Absolute path for logo images (make sure the images are available in the directory)
    logo_path = f"C:/Users/NeerajAntil/Downloads/CARD/assets/comp/{company['logo']}"
    company["logo"] = logo_path
    
    template = Template(open("index.html").read())
    return template.render(
        serial=candidate["S.No"],
        name=candidate["Name"],
        email=candidate["Email ID"],
        roll=candidate["Roll No"],
        course=candidate["Course"],
        college=candidate["College"],
        company_name=company["name"],
        waiting_room=company["waiting_room"],
        logo=company["logo"],
        ticket_no=ticket_no
    )

def save_pdf(candidate_id, name, ticket_htmls):
    """Saves multiple tickets as a single A4 PDF."""
    html_content = """<html><body style='font-family: sans-serif;'>"""
    for html in ticket_htmls:
        html_content += html + "<hr>"
    html_content += "</body></html>"
    
    pdf_filename = f"{candidate_id}_{name.replace(' ', '_')}.pdf"
    folder = name[0].upper()
    os.makedirs(folder, exist_ok=True)
    pdf_path = os.path.join(folder, pdf_filename)
    
    # Path to wkhtmltopdf executable
    config = pdfkit.configuration(wkhtmltopdf=r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe')  # Update the path if needed
    
    # Options for wkhtmltopdf
    options = {
        'no-images': True,  # Disable image fetching
        'enable-local-file-access': None,  # Allow access to local files (important for images)
        'no-outline': None,  # Optional: prevent outlines from being created
    }
    
    try:
        pdfkit.from_string(html_content, pdf_path, configuration=config, options=options)
        print(f"Saved: {pdf_path}")
    except Exception as e:
        print(f"Error generating PDF for {name}: {e}")

def main():
    last_id = last_state["last_candidate_id"]
    last_ticket = last_state["last_ticket_id"]
    
    for _, row in df.iterrows():
        if row["S.No"] <= last_id:
            continue  # Skip already processed candidates
        
        applied_companies = str(row["Companies Applied To"]).split(",")[:3]  # Max 3 tickets
        tickets = []
        
        for i, company in enumerate(applied_companies, start=1):
            last_ticket += 1
            tickets.append(generate_ticket_html(row, company.strip(), last_ticket))
        
        save_pdf(row["S.No"], row["Name"], tickets)
        last_id = row["S.No"]
    
    # Save state for resumption
    with open(STATE_FILE, "w") as f:
        json.dump({"last_candidate_id": last_id, "last_ticket_id": last_ticket}, f)
    
    print("Processing complete!")

if __name__ == "__main__":
    main()

