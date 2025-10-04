# Job Application Email Manager

![Google Apps Script](https://img.shields.io/badge/Platform-Google%20Apps%20Script-blue?logo=google)
![Automation](https://img.shields.io/badge/Automation-Enabled-brightgreen)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Personal-lightgrey)

A Google Apps Script that automatically manages and organizes job application emails from Gmail into a structured Google Sheet for efficient tracking and follow-up.

---

## Overview

This script processes the Gmail inbox in two main phases:

1. **Initial Confirmation** – Logs general "application received" messages to the `Email Data` sheet.  
2. **Action Required** – Identifies and logs critical next-step emails (such as interviews, assessments, or offers) to the `Actionable Jobs` sheet.

---

## Key Features

### Data Freshness
Automatically clears the contents of both target sheets before each run, ensuring the most recent and relevant data is always displayed.

### Intelligent Filtering
Uses a refined `ACTION_SEARCH_PHRASE` for precision filtering:
- Scans only emails from the last four months  
- Excludes unwanted senders (`github.com`, `Planet Fitness`, etc.) and subjects  
- Captures only application-related messages

### Detailed Logging
The `Actionable Jobs` sheet records:
- Date  
- Sender name  
- Subject  
- Keyword that triggered the match  
- Full message body for quick reference

---

## Setup and Configuration

Before running, configure the Google Sheet connection.

### 1. Link to Spreadsheet

In your `job_processor.gs` file, replace the placeholder `SPREADSHEET_ID` with your Google Sheet ID. It is in the url for the sheet after "https://docs.google.com/spreadsheets/d/"
// Spreadsheet ID must be updated prior to execution.
const SPREADSHEET_ID = '1kehm_gWNazhhOz4TJIA3Ar1ClxMmEsv5jfinlVoe7Lg';
