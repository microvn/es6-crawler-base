# Crawler Code Base
This code base for Crawler base on ES6 Express - Mysql - ElasticSearch - Docker Compose

# Install
##1. Edit .env

ENVIRONMENT = development
PORT=3333
MYSQL_HOST=localhost  // Important
MYSQL_PORT=3306 
MYSQL_DB=crawler // Important
MYSQL_USERNAME=  // Important
MYSQL_PASSWORD=  // Important
MONGODB_URI=
ES_HOST=  // Important
ES_PORT=  // Important
REDIS_HOST=127.0.0.1 // Important
REDIS_PORT=6379  // Important
REDIS_DB=0  // Important
REDIS_PREFIX=
QUEUE_DRIVER=
QUEUE_HOST=
QUEUE_PORT=
QUEUE_DB=
SLACK_KEY=
JWT_KEY=
JWT_TIME=1200000000
EMAIL_DRIVER=sendgrid
EMAIL_SENDGRID_KEY=
EMAIL_SENDER=support@gmail.com
MAX_FILE_UPLOAD=30
PATH_STORAGE=/zdata/name_project/
PATH_STORAGE_IMAGE=/zdata/name_project/images
HOST_IMAGE=http://localhost/
NOTIFY_DRIVER=pushy
NOTIFY_KEY_PUSH=
PATH_CONVERT_TIME=/path_to_convert_file_in_scripts_folder/convertTime.py 
IS_QUEUE=true


# Contributors
<a href="https://github.com/tothang">ToThang</a>

Security Vulnerabilities
If you discover a security vulnerability within Project, please send an e-mail to microvn.gm@gmail.com
