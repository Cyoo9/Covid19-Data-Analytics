const express = require('express');
const path = require('path');

const app = express();

//app.get('/api/members');

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

// slash = route for index page; need route handler
//go to webpage = get request
/*app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'));
});*/
//nodemon==> dont need to refresh page

app.post('/result', function(req, res) {
    res.send("Thank u so much");
});

app.get('/result', function(req, res) {
    res.send("How did u get here?");
});

app.listen(PORT, () => console.log("Server started on port 5000")); 