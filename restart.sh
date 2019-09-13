#!/bin/bash
# restart container services
echo '####################################################'
echo 'restart container services...'
echo '####################################################'
docker restart api schedule
docker-compose scale queue=0
docker-compose scale queue=15
