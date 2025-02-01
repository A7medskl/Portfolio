from flask import Flask, jsonify, request
import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/wakatime', methods=['GET'])
def get_wakatime_data():
    try:
        api_key = os.getenv('WAKATIME_API_KEY')
        headers = {
            'Authorization': 'Basic ' + base64.b64encode(api_key.encode()).decode(),
            'Content-Type': 'application/json'
        }
        response = requests.get('https://wakatime.com/api/v1/users/current/stats/all_time', headers=headers)
        response.raise_for_status()
        data = response.json()

        # Filter out unwanted languages
        unwanted_languages = {"Docker", "Git", "Batchfile", "Image (svg)","TSConfig","Git Config","YAML","Elixir","Bash",'Markdown',"Text","INI"}
        filtered_languages = [lang for lang in data['data']['languages'] if lang['name'] not in unwanted_languages]
        data['data']['languages'] = filtered_languages

        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Failed to fetch Wakatime data', 'details': str(e)}), 500

if __name__ == '__main__': 
    app.run(port=3000)
