from flask import Flask
from flask_cors import CORS
from routes.calculator import bp as calculator_bp
from routes.products   import bp as products_bp
from routes.dataset    import bp as dataset_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

app.register_blueprint(calculator_bp)
app.register_blueprint(products_bp)
app.register_blueprint(dataset_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
