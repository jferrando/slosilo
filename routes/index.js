function expose(req, res, next) {
    req.db = req.app.get('db');
    req.slosilo = req.app.get('slosilo');
    next();
}
exports.index = function (req, res) {
    res.render('index', {
        title: 'Express'
    });
};

function loadUserProjects(req, res, next) {
    req.db.view('projects/byUser', {
      key: req.session.user._id,
			include_docs: true
    }, function (err, col) {
        if (err) {
            console.error(err);
            return next(err);
        }
				console.log('----');
        res.locals.projects = col;
				console.log(res.locals.projects);
        return next();
    });
}
exports.dashboard = [expose,loadUserProjects, function (req, res) {
    res.render('dashboard', {
        title: 'Dashboard'
    });
}];
exports.register = require('./register');
exports.login = require('./login');
// new project
exports.viewNewProject = function (req, res) {
    res.render('new', {
        title: '*New project*'
    });
};
exports.makeNewProject = [expose, function (req, res) {
    req.db.save({
        type: 'project',
        created_at: new Date().getTime(),
        owner: req.session.user._id,
        name: req.body.name,
        description: req.body.description,
        isPublic: req.body.ispublic
    }, function (err, doc) {
        if (err) {
            console.error(err);
            req.pushMessage('error', 'Whooops', 'Something wrong happen. Try again');
            return res.redirect('/new');
        }
        req.pushMessage('success', 'Cool!', req.body.name + ' has been created');
        return res.redirect('/dashboard');
    });
}];
