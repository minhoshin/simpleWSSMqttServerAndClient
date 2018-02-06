const express = require('express');
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


app.get('/', function(req, res){
    res.render('index.html')
});


app.listen(3000, function(){
    console.log("Express server has started on port 3000")
});
