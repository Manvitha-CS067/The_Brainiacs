# 🏗️ Alumni Attendance Predictor – Workforce Optimization Tool

A Node.js + Express-based backend that:

- Loads alumni data from a CSV
- Supports USN-based alumni search
- Predicts event attendance using RSVP, past attendance, and distance
- Optimizes workforce planning by recommending required catering and seating staff
- Suggests chairs, meals, and parking resources based on attendance prediction

🔧 This project fits under the **Construction and Workforce Planning & Optimization** theme, using event predictions to minimize under- or over-staffing during alumni events.

Frontend is built with HTML and served via Express.

## 🚀 Getting Started

1. Clone the repo
2. Run `npm install`
3. Start the server: `node app.js`

## 📁 File Structure

- `app.js` – Express backend
- `predict.html` or 'index.html' or 'search.html' or 'viewall.html' – Frontend interface
- `alumni_data_with_usn_and_distances.csv` – Alumni dataset
