#!/bin/bash

echo "form getVolteStats.sh"
rm -rf log
sshpass -p $3 scp -o "StrictHostKeyChecking=no" -r $2@$1:/home/sysadmin/log .
