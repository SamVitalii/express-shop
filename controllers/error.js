export const get404 = (req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Error 404', path: '/404', isAuthenticated: req.session.isLoggedIn});
};

export const get500 = (req, res, next) => {
    res.status(500).render('500', {pageTitle: 'Error 500', path: '/500', isAuthenticated: req.session.isLoggedIn});
};

export const errorHandle = (err, next) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
}