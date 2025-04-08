const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

let alumniData = [];

// Load CSV data
fs.createReadStream(path.join(__dirname, 'alumni_data_with_usn_and_distances.csv'))
  .pipe(csv())
  .on('data', (row) => {
    const programCode = row.USN?.slice(6, 8);
    const programMap = {
      'CS': 'Computer Science',
      'CV': 'Civil Engineering',
      'ME': 'Mechanical Engineering',
      'EC': 'Electronics',
      'EE': 'Electrical Engineering',
      'CH': 'Chemical Engineering'
    };

    const distance = parseFloat(row.Distance || row.Current_Distance);

    alumniData.push({
      usn: row.USN?.toUpperCase(),
      name: row.Name,
      location: row.Location,
      rsvp: row.RSVP === 'Yes',
      pastAttendance: row.Past_Attendance === 'Yes',
      currentDistance: isNaN(distance) ? null : distance,
      raw: row,
      program: programMap[programCode] || 'Other',
      graduationYear: parseInt(row.USN?.slice(4, 6)) + 2000
    });
  })
  .on('end', () => {
    console.log(`✅ Loaded ${alumniData.length} alumni entries`);
  });

// 🔍 Search by USN
app.get('/api/search/:usn', (req, res) => {
  const usn = req.params.usn.trim().toUpperCase();
  const result = alumniData.find(alumni => alumni.usn === usn);

  if (!result) {
    return res.status(404).json({ success: false, error: 'Alumni not found' });
  }

  res.json({
    success: true,
    data: {
      USN: result.raw.USN,
      Name: result.raw.Name,
      Location: result.raw.Location,
      RSVP: result.raw.RSVP,
      Past_Attendance: result.raw.Past_Attendance,
      Current_Distance: result.raw.Distance || result.raw.Current_Distance || result.currentDistance
    }
  });
});

// 🤖 Prediction endpoint
app.post('/api/predict', (req, res) => {
  const { eventType, eventDate, eventTime, weather, alumniCount } = req.body;

  if (!eventType || !eventDate || !eventTime || !weather || !alumniCount) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const isWeekend = ['Saturday', 'Sunday'].includes(
    new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' })
  );

  const validAlumni = alumniData
    .filter(alumni => !isNaN(alumni.currentDistance))
    .sort(() => Math.random() - 0.5)
    .slice(0, alumniCount);

  if (validAlumni.length === 0) {
    return res.status(500).json({ success: false, error: 'No valid alumni data to make prediction' });
  }

  let predicted = validAlumni.map(alumni => {
    let score = 0;
    if (alumni.rsvp) score += 0.4;
    if (alumni.pastAttendance) score += 0.3;
    if (alumni.currentDistance < 50) score += 0.2;
    else if (alumni.currentDistance < 100) score += 0.1;
    if (isWeekend) score += 0.1;
    if (['Rainy', 'Snowy'].includes(weather)) score -= 0.2;

    return score >= 0.5 ? 1 : 0;
  });

  const expectedAttendees = predicted.reduce((a, b) => a + b, 0);

  res.json({
    success: true,
    prediction: {
      attendancePercent: Math.round((expectedAttendees / alumniCount) * 100),
      expectedAttendees,
      recommendedResources: {
        chairs: Math.round(expectedAttendees * 1.1),
        meals: Math.round(expectedAttendees * 1.1),
        parkingSpaces: Math.round(expectedAttendees * 0.7)
      },
      recommendations: [
        'Send reminder emails 1 week before the event',
        'Offer virtual attendance option',
        `Prepare ${Math.round(expectedAttendees * 0.1)} extra resources for unexpected attendees`
      ]
    }
  });
});



// Serve frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
