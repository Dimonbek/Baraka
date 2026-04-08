# admin_views.py
import random
import datetime
from flask import redirect, url_for, flash, request
from flask_admin import Admin, expose, BaseView
from flask_admin.contrib.sqla import ModelView
from flask_admin.actions import action
from flask_login import current_user, LoginManager, UserMixin
from werkzeug.security import generate_password_hash
from .config import SessionLocal, engine, Base
from .models import User, Partner, Offer
from .utils import flash_sale, isrof_stop_stats, send_evening_push

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Flask‑Login user wrapper
class AuthUser(UserMixin):
    def __init__(self, user: User):
        self.id = user.id
        self.email = user.email
        self.is_admin = user.is_admin

# Secure ModelView – only admin users can access
class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and getattr(current_user, "is_admin", False)

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login', next=request.url))

class UserAdmin(SecureModelView):
    column_exclude_list = ["password_hash"]
    form_excluded_columns = ["password_hash"]
    column_searchable_list = ["email"]
    can_create = True
    can_edit = True
    can_delete = True

    def on_model_change(self, form, model, is_created):
        # If a password field is added to the form, hash it
        if hasattr(form, "password") and form.password.data:
            model.password_hash = generate_password_hash(form.password.data)

class PartnerAdmin(SecureModelView):
    column_searchable_list = ["name", "address", "location"]

class OfferAdmin(SecureModelView):
    column_list = ["name", "partner", "original_price", "discount_percent", "expiry", "is_active", "saved_kg", "saved_units", "image_url"]
    column_filters = ["is_active", "partner"]
    column_searchable_list = ["name"]

    @action('flash_sale', 'Flash Sale', 'Apply flash sale to selected offers?')
    def action_flash_sale(self, ids):
        session = SessionLocal()
        try:
            offers = session.query(Offer).filter(Offer.id.in_(ids)).all()
            count = 0
            now = datetime.datetime.utcnow()
            for offer in offers:
                if offer.is_active and 0 < (offer.expiry - now).total_seconds() <= 3600:
                    new_discount = random.randint(60, 80)
                    if offer.discount_percent < new_discount:
                        offer.discount_percent = new_discount
                        count += 1
            session.commit()
            flash(f"Flash Sale applied to {count} offers.", "success")
        finally:
            session.close()
        return redirect(url_for('.index_view'))

    @action('isrof_stats', 'Isrof Stats', 'Show saved statistics for selected offers?')
    def action_isrof_stats(self, ids):
        session = SessionLocal()
        try:
            offers = session.query(Offer).filter(Offer.id.in_(ids)).all()
            total_kg = sum(o.saved_kg for o in offers)
            total_units = sum(o.saved_units for o in offers)
            flash(f"Saved: {total_kg:.2f} kg, {total_units} units.", "info")
        finally:
            session.close()
        return redirect(url_for('.index_view'))

# Dashboard view for custom sections (Feed, Moderation, Push)
class DashboardView(BaseView):
    @expose('/')
    def index(self):
        session = SessionLocal()
        offers = session.query(Offer).filter(Offer.is_active == True).order_by(Offer.expiry).all()
        pending_images = session.query(Offer).filter(Offer.image_url != None, Offer.is_active == True).all()
        session.close()
        return self.render('admin/dashboard.html', offers=offers, pending_images=pending_images)

    @expose('/push')
    def push(self):
        success = send_evening_push()
        flash('Evening push sent.' if success else 'Push failed.', 'info')
        return redirect(url_for('.index'))

def init_admin(app):
    admin = Admin(app, name="Uvol bo'lmasin Admin", template_mode='bootstrap4', url='/admin')
    admin.add_view(UserAdmin(User, SessionLocal()))
    admin.add_view(PartnerAdmin(Partner, SessionLocal()))
    admin.add_view(OfferAdmin(Offer, SessionLocal()))
    admin.add_view(DashboardView(name='Dashboard', endpoint='dashboard'))
    return admin
