#!/bin/bash
echo -------------------- starting ue client ----------------------

echo $#
echo $@

sshpass -p $6 scp -o "StrictHostKeyChecking=no" $1/$2/$3 $5@$4:/home/$5/
sshpass -p $6 ssh -o "StrictHostKeyChecking=no" $5@$4 sshpass -p $6 sudo rm -f /root/ue/config/ue.cfg
sshpass -p $6 ssh -o "StrictHostKeyChecking=no" $5@$4 sshpass -p $6 sudo ln -sf /home/$5/$3 /root/ue/config/ue.cfg
sleep 1
sshpass -p $6 ssh -o "StrictHostKeyChecking=no" $5@$4 sshpass -p $6 sudo service lte restart
sleep 5
