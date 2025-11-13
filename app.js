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
    res.render('businesses/index', { business });
}) 

app.get('/business/new', async(req, res) => {
    res.render('businesses/new')
})

app.get('/business/:id', async(req, res) => {
    const business = await Business.findById(req.params.id).populate('reviews');
    res.render('businesses/show', { business });
})

app.post('/business', async (req, res) => {
    const newBusiness = new Business( req.body.business );
    await newBusiness.save();
    res.redirect(`/business/${newBusiness.id}`);
});

app.get('/business/:id/update', async(req, res) => {
    const business = await Business.findById(req.params.id);
    res.render('businesses/update', { business })
})

app.put('/business/:id', async (req, res) => {
    const { id } = req.params;
    const updatedBusiness = await Business.findByIdAndUpdate(id, { ...req.body.business });
    res.redirect(`/business/${req.params.id}`);
});

app.delete('/business/:id', async (req, res) => {
    const { id } = req.params;
    await Business.findByIdAndDelete(id);
    res.redirect(`/business`);
});

app.post('/business/:id/reviews', async (req, res) => {
    const business = await Business.findById(req.params.id).populate("reviews");
    const newReview = new Review(req.body.review);
    business.reviews.push(newReview);
    let totalRating = business.reviews.reduce((sum, review) => { 
        return sum + review.rating;
    }, 0);
    business.averageRating = (totalRating / business.reviews.length).toFixed(2);
    await newReview.save();
    await business.save();
    res.redirect(`/business/${business.id}`);
});

app.delete('/business/:id/reviews/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await Business.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    const business = await Business.findById(id).populate("reviews");
    let totalRating = business.reviews.reduce((sum, review) => { 
        return sum + review.rating;
    }, 0);
    business.averageRating = (totalRating / business.reviews.length).toFixed(2);
    await business.save();
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/business/${id}`);
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
})