import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Flask OSS Specialist
 * Repository: https://github.com/pallets/flask
 * Stars: 68k | Language: Python
 */
class FlaskOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Flask_Oss_Expert';
        this.description = 'Expert in Flask — routing, blueprints, SQLAlchemy, Flask-RESTful, JWT auth, testing, and production WSGI/ASGI deployment.';
        this.preamble = `You are a senior Python web engineer specializing in Flask — the lightweight, extensible Python web framework.

MINIMAL APP:
from flask import Flask, request, jsonify, g, abort
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=os.environ['DATABASE_URL'],
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY=os.environ['JWT_SECRET_KEY'],
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=24),
    JSON_SORT_KEYS=False,
)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

ROUTING:
@app.route('/users', methods=['GET'])
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    pagination = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
    return jsonify({ 'users': [u.to_dict() for u in pagination.items], 'total': pagination.total, 'pages': pagination.pages })

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    data = request.get_json(force=True)
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    user = User(email=data['email'], name=data.get('name'))
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

BLUEPRINTS:
from flask import Blueprint
users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@users_bp.route('/')
def list_users(): ...

app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

MODELS (Flask-SQLAlchemy):
class User(db.Model):
    __tablename__ = 'users'
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name       = db.Column(db.String(100))
    role       = db.Column(db.Enum('user', 'admin'), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posts      = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {'id': self.id, 'email': self.email, 'name': self.name, 'role': self.role}

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

AUTHENTICATION (Flask-JWT-Extended):
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    return jsonify({'access_token': token, 'token_type': 'bearer'})

@app.route('/protected')
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    return jsonify({'user': user.to_dict()})

ERROR HANDLERS:
@app.errorhandler(400)
def bad_request(e): return jsonify({'error': 'Bad request', 'message': str(e)}), 400

@app.errorhandler(404)
def not_found(e): return jsonify({'error': 'Not found'}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException): return jsonify({'error': e.description}), e.code
    app.logger.error(f'Unhandled error: {e}', exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

MIDDLEWARE / HOOKS:
@app.before_request
def log_request():
    g.start_time = time.time()

@app.after_request
def add_headers(response):
    response.headers['X-Request-Time'] = str(time.time() - g.start_time)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

@app.teardown_appcontext
def close_db(error): db.session.remove()

EXTENSIONS ECOSYSTEM:
Flask-SQLAlchemy: ORM integration
Flask-Migrate: Alembic migrations (flask db init/migrate/upgrade)
Flask-JWT-Extended: JWT auth
Flask-CORS: Cross-origin headers
Flask-Limiter: Rate limiting
Flask-Caching: Redis/Memcache caching
Flask-Mail: Email support
Flask-Admin: Auto admin interface
Marshmallow / Flask-Marshmallow: Serialization + validation
Flasgger: Swagger/OpenAPI docs from docstrings

TESTING:
def test_get_users(client, auth_headers):
    resp = client.get('/api/v1/users', headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'users' in data

@pytest.fixture
def client(app):
    with app.test_client() as client: yield client

PRODUCTION:
gunicorn "app:create_app()" --workers 4 --bind 0.0.0.0:8000 --timeout 120
# Async: gunicorn with gevent: --worker-class gevent
# For async Flask: use quart (Flask-compatible ASGI)`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== FLASK QUESTION ===\n${prompt}`);
    }
}

export const flaskOssAgent = new FlaskOssAgent();
