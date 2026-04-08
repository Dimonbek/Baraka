# app.py
import os
from flask import Flask, render_template, redirect, url_for, request, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from .config import SessionLocal, engine, Base
from .models import User
from .admin_views import init_admin

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'super-secret-key')

# Setup Flask-Login
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    session = SessionLocal()
    try:
        user = session.query(User).get(int(user_id))
        if user:
            from .admin_views import AuthUser
            return AuthUser(user)
    finally:
        session.close()
    return None

# Simple login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        session = SessionLocal()
        try:
            user = session.query(User).filter_by(email=email).first()
            if user and check_password_hash(user.password_hash, password):
                login_user(AuthUser(user))
                flash('Logged in successfully.', 'success')
                next_page = request.args.get('next') or url_for('admin.index')
                return redirect(next_page)
            else:
                flash('Invalid credentials.', 'error')
        finally:
            session.close()
    return render_template('login.html')

# Logout route
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out.', 'info')
    return redirect(url_for('login'))

# Register admin blueprint / views
admin = init_admin(app)

# Home redirect to admin dashboard if logged in, else to login
@app.route('/')
def home():
    if current_user.is_authenticated:
        return redirect(url_for('admin.index'))
    return redirect(url_for('login'))

if __name__ == '__main__':
    # Ensure DB tables exist
    Base.metadata.create_all(bind=engine)
    # Run development server
    app.run(host='0.0.0.0', port=5001, debug=True)
