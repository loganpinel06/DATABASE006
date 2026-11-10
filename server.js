//utilize express.js to create a server easily using Node
const express = require('express');
const path = require('path');
//node come preinstalled with sqlite to help manage our .db file
const { DatabaseSync } = require('node:sqlite');

//create the express app and define the port (3000)
const app = express();
const PORT = 3000;
//sync the .db file to the server
const db = new DatabaseSync(path.join(__dirname, 'art.db'));

//declare the database columns that are accessible
const editableColumns = ['Title', 'YearOfWork', 'Medium', 'Width', 'Height',
  'Cost', 'MSRP', 'Description', 'WikiLink'];

//let express read the data a <form> sends (available as req.body)
app.use(express.urlencoded({ extended: false }));

//serve the painting images from the art folder
app.use('/art', express.static(path.join(__dirname, 'art')));

//default get route "/" (landing page)
//renders index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//get api /paintings: send every painting as JSON
app.get('/paintings', (req, res) => {
  //SQL Query to run to select all paintings
  const rows = db.prepare(`
    SELECT p.*, a.FirstName, a.LastName, g.GalleryName
    FROM Paintings p
    LEFT JOIN Artists a ON p.ArtistID = a.ArtistID
    LEFT JOIN Galleries g ON p.GalleryID = g.GalleryID
    ORDER BY p.Title
  `).all();
  //send a response with the json
  res.json(rows);
});

//post api: send information from the form ot the db
app.post('/update', (req, res) => {
  //get the selected painting by its id
  const id = Number(req.body.PaintingID);
  //determine the SQL columns that are being edited
  const setParts = editableColumns.map(col => `${col} = ?`).join(', ');
  //get the values from the form that we need to update
  const values = editableColumns.map(col => req.body[col]);
  //prepare and run the SQL query to update the db
  db.prepare(`UPDATE Paintings SET ${setParts} WHERE PaintingID = ?`)
    .run(...values, id);
  //send a response to the front end confirming that the information was saved to the db
  res.redirect(303, '/?saved=' + id);
});

//start the server (run in terminal | node server.js)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
