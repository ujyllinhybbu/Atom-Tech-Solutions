const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Business = require('./models/business');
const Review = require('./models/review');

const url = 'mongodb+srv://kongdong99:pitalee@cluster0.zgtf2yt.mongodb.net/yelpclone?retryWrites=true&w=majority'


mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/business', async(req, res) => {
    const business = await Business.find({});
    console.log(business);
    res.render('businesses/index', { business });
}) 

app.get('/business/new', (req, res) => {
    res.render('businesses/new')
})

app.get('/business/:id', async(req, res) => {
    const business = await Business.findById(req.params.id);
    console.log(business)
    res.render('businesses/show', { business });
})

app.get('/business/:id/update', async(req, res) => {
    const business = await Business.findById(req.params.id);
    console.log(business)
    res.render('businesses/update', { business })
})

app.put('/business/:id', async (req, res) => {
    const updatedData = req.body.business;
    const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, updatedData, { new: true});
    console.log(updatedBusiness);
    res.redirect(`/business/${req.params.id}`);
});

app.post('/business', (req, res) => {
    const newBusiness = new Business( req.body.business );
    newBusiness.save();
    console.log(newBusiness);
    res.redirect(`/business/${newBusiness.id}`);
});

app.delete('/business/:id', async (req, res) => {
    const deletedBusiness = await Business.findByIdAndDelete(req.params.id);
    console.log(deletedBusiness);
    res.redirect(`/business`);
});


app.listen(3000, () => {
    console.log('Serving on port 3000')
})