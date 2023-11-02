# Data Extraction and Storage Script

This script automates the process of data collection from various web pages and stores it in a MySQL database. It includes the ability to navigate web pages, extract table data, connect to a MySQL database, verify the existence of data, insert new data, and provide a final report on the process.

## Features

### 1. Web Navigation with Puppeteer
   - Utilizes the `Puppeteer` library for headless browser navigation.
   - Navigates to specific web pages, including 'https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/'.

### 2. Data Extraction from Tables
   - Identifies and extracts table data.
   - Organizes the data into a matrix format, reflecting the table's rows and columns.

### 3. Connection to MySQL Database
   - Establishes a connection to a local MySQL database named 'esg' using the `mysql2` library.

### 4. Data Verification and Insertion
   - Checks if the extracted data already exists in the 'regask' table of the database.
   - If the data is new, it inserts it into the table along with the current date and time.

### 5. Finalization
   - Ends the database connection.
   - Displays a confirmation message indicating successful data insertion.

## Data Capture Websites

The table below lists the websites from which data is being captured:

| Name | Description | Link | Status |
| --- | --- | --- | --- |
| UN Global Compact | Library with various documents including policies | [Link](https://unglobalcompact.org/library/search?search%5Bissue_areas%5D%5B%5D=211&search%5Bkeywords%5D=&search%5Bcontent_type%5D=12) | OK |
| ... | ... | ... | ... |
| Regulation Ask | Key trends in ESG regulations in 2022 and beyond | [Link](https://regask.com/key-trends-in-esg-regulations-in-2022-and-beyond/) | OK |

(Continue the table as needed for each website.)

## Objective

The main goal of this script is to streamline and automate the process of data collection and storage, ensuring efficiency, avoiding duplication, and maintaining data integrity.

## Running the Scripts

To initiate the data extraction and storage process, run `index.js` using Node.js:

```sh
node index.js
```

This will sequentially execute all the scripts involved in the data extraction and storage process. Currently, the script is set up to scrape data from the Airtable and Regask websites. Please ensure that all necessary dependencies are installed and that your MySQL database is properly configured before running the script.

---

**Note**: The `index.js` script is designed to run all the necessary scripts in sequence. However, as of now, some scripts are actively uploading data to the database, while others are still in development. The project is ongoing, and further improvements and additions are planned. Ensure to keep track of the project's progress and update your local repository as needed.