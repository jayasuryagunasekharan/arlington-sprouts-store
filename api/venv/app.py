from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database configuration
db_username = os.environ.get('DB_USERNAME', 'default_username')
db_password = os.environ.get('DB_PASSWORD', 'default_password')
db_host = os.environ.get('DB_HOST', 'default_host')
db_name = os.environ.get('DB_NAME', 'default_dbname')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_username}:{db_password}@{db_host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

class Sprouts(db.Model):
    __tablename__ = "sprouts"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    cost = db.Column(db.Float)
    retailer = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, name, cost, retailer):
        self.name = name
        self.cost = cost
        self.retailer = retailer

class SproutSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'cost', 'retailer', 'date')

sprout_schema = SproutSchema()
sprouts_schema = SproutSchema(many=True)

@app.route('/api/listsprouts', methods=['GET'])
def list_sprouts():
    all_sprouts = Sprouts.query.all()
    return jsonify(sprouts_schema.dump(all_sprouts))

@app.route('/api/sproutdetails/<int:id>', methods=['GET'])
def sprout_details(id):
    sprout = Sprouts.query.get_or_404(id)
    return sprout_schema.jsonify(sprout)

@app.route('/api/sproutupdate/<int:id>', methods=['PUT'])
def sprout_update(id):
    sprout = Sprouts.query.get_or_404(id)
    data = request.json
    sprout.name = data.get('name', sprout.name)
    sprout.cost = data.get('cost', sprout.cost)
    sprout.retailer = data.get('retailer', sprout.retailer)
    db.session.commit()
    return sprout_schema.jsonify(sprout)

@app.route('/api/sproutdelete/<int:id>', methods=['DELETE'])
def sprout_delete(id):
    sprout = Sprouts.query.get_or_404(id)
    db.session.delete(sprout)
    db.session.commit()
    return sprout_schema.jsonify(sprout)

@app.route('/api/sproutsadd', methods=['POST'])
def sprouts_add():
    data = request.json
    new_sprout = Sprouts(
        name=data['name'],
        cost=data['cost'],
        retailer=data['retailer']
    )
    db.session.add(new_sprout)
    db.session.commit()
    return sprout_schema.jsonify(new_sprout), 201

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
