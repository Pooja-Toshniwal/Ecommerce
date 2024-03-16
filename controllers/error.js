// app.use((req, res, next) => {
//     // res.sendFile(path.join(__dirname,'views','error.html'));
//     res.status(404).render('404', { pageTitle: 'Page not Found', path: 'random' });
// })

exports.get404 = (req,res,next)=>{
    res.status(404).render('404', { pageTitle: 'Page not Found', path: 'random' });
}

exports.get500 = (req,res,next)=>{
    res.status(500).render('500', { pageTitle: 'Error', path: 'random' });
}
