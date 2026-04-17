const bcrypt = require('bcryptjs');
const { User } = require('../../models');

// Render login page
exports.loginPage = (req, res) => {
  res.render('login', { error: req.flash('error'), layout: false });
};

// Handle login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, is_active: 1 } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/admin/login');
    }

    await user.update({ last_login: new Date() });
    req.session.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      avatar: user.avatar
    };
    res.redirect('/admin');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Error del servidor');
    res.redirect('/admin/login');
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};
