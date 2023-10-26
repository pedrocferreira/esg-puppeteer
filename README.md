# Data Extraction and Storage Script

This script automates the process of data collection from a web page and stores it in a MySQL database.

## Features

1. **Web Navigation with Puppeteer**:
   - Utilizes the `Puppeteer` library to open a browser in headless mode.
   - Navigates to the page 'https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/'.

2. **Data Extraction from Table**:
   - Identifies and extracts information from a table on the page.
   - Organizes the data into a matrix representing the rows and columns of the table.

3. **Connection to MySQL Database**:
   - Establishes a connection to a local MySQL database named 'esg' using the `mysql2` library.

4. **Data Verification and Insertion**:
   - For each extracted row, it checks if the data already exists in the 'regask' table of the database.
   - If the data does not exist, it inserts them into the table with the current date and time.

5. **Finalization**:
   - After processing and inserting all the data, the script ends the connection to the database.
   - Displays a confirmation message indicating that the data has been successfully inserted.

## Data Capture Websites

The list below contains the websites that are being used to capture data:

| Name | Description | Link | Check |
| --- | --- | --- | --- |
| UN Global Compact | Library with various documents including policies | [Link](https://unglobalcompact.org/library/search?search%5Bissue_areas%5D%5B%5D=211&search%5Bkeywords%5D=&search%5Bcontent_type%5D=12) | OK |
| Moody's | Example of a provider normalizing through tools | [Link](https://www.moodys.com/web/en/us/capabilities/esg.html) | No |
| SSE Stock Exchange (UN) | Mapping of regulation and enforcement by country | [Link](https://sseinitiative.org/esg-guidance-database/) | In Progress |
| SSE Stock Exchange Regulations (UN) | Descriptions of various regulations | [Link](https://sseinitiative.org/regulation/) | OK |
| Green Finance Platform | 780 policies | [Link](https://www.greenfinanceplatform.org/financial-measures/browse/country/france-284) |  |
| Global Data | 631 regulations | [Link](https://www.globaldata.com/esg/regulations/) |  |
| Climatiq | They mention 4000 regulations, but have collected 30 | [Link](https://www.climatiq.io/blog/database-your-esg-standards-frameworks-and-regulation-overview) |  |
| Airtable | - | [Link](https://airtable.com/appzfiUwVci5GhjlO/shrJethBEwOVaKH5R/tblIbzy1dGWtPjwrO?backgroundColor=blue&viewControls=on) |  |
| Climatiq Data | - | [Link](https://www.climatiq.io/data) |  |
| ESG Clarity | Website with various articles, including one about regulations | [Link](https://esgclarity.com/esg-regulations-around-the-world/) |  |
| White Case | An analysis of three major regulatory developments in the EU and US - EU Directive proposals on Due Diligence and Corporate Sustainability Reporting and US SEC Climate Change Disclosure Rules | [Link](https://www.whitecase.com/insight-alert/global-esg-regulatory-framework-toughens) |  |
| Regulation Ask | Key trends in ESG regulations in 2022 and beyond | [Link](https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/) | OK |
| WBC FSD | Sustainability consortium | [Link](https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/) |  |
| PRI | Database with 868 regulations (links to) | [Link](https://www.unpri.org/policy/regulation-database) |  |

## Objective

The main goal of this script is to ensure efficient data collection from a table on the web page and store it in the database, avoiding duplications.

---
<<<<<<< HEAD

Attention:
I haven't done the part of running all the scripts together in index.js yet, I intend to do this to make it easier to run all the scripts.
Some scripts are uploading data to the database, others are not yet.

I still want to fix many things in this project.
