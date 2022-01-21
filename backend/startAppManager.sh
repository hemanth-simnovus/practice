#!/bin/bash
echo -------------------- starting appManager client ----------------------

sshpass -p $3 ssh -o "StrictHostKeyChecking=no" $2@$1 sshpass -p $3 sudo service app-manager restart
sleep 4

