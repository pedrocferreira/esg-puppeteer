# Project Name

A brief description of what the project accomplishes and its purpose.

## Table of Contents

- [Folder Structure](#folder-structure)
- [Script Files](#script-files)
- [Collected Data](#collected-data)
- [Technologies Used](#technologies-used)
- [Data Sources](#data-sources)
- [Getting Started](#getting-started)

## Folder Structure

- **csv/**: Stores CSV files extracted from various data sources.
- **csv-main/**: Holds a comprehensive CSV file with all compiled data (currently incomplete).
- **join/**: Contains scripts to concatenate CSV files.
- **pdf/**: Directory for downloaded PDFs from data sources (currently only from sseinitiative).
- **pdf-links/**: Includes CSV files with links to all the sourced PDFs.

## Script Files

- **airtable-pdf.js**: Script to extract PDFs from collected Airtable links.
- **airtable.js**: Collects data from Airtable.
- **compactGlobal.js**: Gathers data from the UN Global Compact.
- **greenfinanceplatform-data.js**: Retrieves data from the Green Finance Platform.
- **index.js**: Executes a sequence of scripts.
- **ragask.js**: Collects data from RegASK.
- **sseinitiative.js**: Collects data from sseinitiative.org/regulation.
- **sseinitiativegui.js**: Gathers data from the sseinitiative.org ESG guidance database.
- **sseinitiativegui-pdf.js**: Creates a CSV with PDF links extracted from the sseinitiative.org ESG guidance database.

## Collected Data

The `csv` and `pdf-links` folders contain the data harvested, including all PDFs extracted from the sseinitiative and Airtable sources.

## Technologies Used

This project utilizes Puppeteer and RobotJs for automation and scripting. Note: RobotJs requires C++ to be installed on the machine.

## Data Sources

Data has been extracted from the following sites and organized in the `csv` folder:

- Airtable
- UN Global Compact
- GlobalData
- RegASK
- sseinitiative.org/esg-guidance-database/
- sseinitiative.org/regulation

## Getting Started

To set up the project environment:

```bash
npm install
