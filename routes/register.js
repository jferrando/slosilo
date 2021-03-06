function loadUserFromForm(req, res, next) {
    req.user = {
        type: 'user',
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        emailVerified: false,
        created_at: new Date().getTime()
    };
    next();
}

function validateNewUser(req, res, next) {
    req.app.get('slosilo').validateNewUser(req.user, function (err, msg) {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (msg && msg.length) {
            req.pushMessage('error', 'error', msg.join(', '));
            return res.redirect('/register');
        }
        next();
    });
}

function checkEmailIsInUse(req, res, next) {
    req.app.get('db').view('users/byEmail', {
        key: req.user.email
    }, function (err, users) {
        console.log(users);
        if (err) {
            console.error(err);
            return next(err);
        }
        if (users && users.length) {
            req.pushMessage('error', 'error', 'email address already in use');
            return res.redirect('/register');
        }
        next();
    });
}

function hashPassword(req, res, next) {
    try {
        req.user.hashedPassword = req.app.get('slosilo').hashPassword(req.body.password);
        return next();
    } catch (err) {
        console.error(err);
        return next(err);
    }
}

function saveUser(req, res, next) {
    req.app.get('db').save(req.user, function (err, doc) {
        if (err) {
            console.error(err);
            return next(error);
        }
        req.user._id = doc.id;
        next();
    });
}
exports.create = [loadUserFromForm, validateNewUser, checkEmailIsInUse, hashPassword, saveUser, function (req, res) {
    req.session.user = req.user;
    req.pushMessage('success', 'Welcome!', req.user.name + ' your account has been created');
    res.redirect('/dashboard');
}];
exports.view = function (req, res) {
    res.render('register', {
        title: 'Register'
    });
};
