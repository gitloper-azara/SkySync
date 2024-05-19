#!/usr/bin/python3
"""Start the API"""
from flask import Flask, jsonify
from app import app_views
from flask_cors import CORS
import os
from os import getenv
from dotenv import load_dotenv

load_dotenv()
secret_key = os.urandom(24)

# ensure flask can locate the templates folder
templates_folder = os.path.join(os.path.dirname(__file__), "app", "templates")

app = Flask(__name__, template_folder=templates_folder)
app.config["SECRET_KEY"] = secret_key
app.register_blueprint(app_views)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.errorhandler(404)
def not_found(error):
    '''custom 404 error handler'''
    return jsonify(
        {"error": "Not found"}
    ), 404


if __name__ == "__main__":
    host = getenv("WEATHER_API_HOST", "0.0.0.0")
    port = int(getenv("WEATHER_API_PORT", 5000))

    # run flask app
    app.run(host=host, port=port, threaded=True)