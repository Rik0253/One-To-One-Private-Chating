
var passport= require('passport');
var authenticationMiddleware= function () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/')
	}
}
module.exports=authenticationMiddleware;