

echo --------------------------------------------- Get Rf information --------------------------------------------------

echo $1

sshpass -p $3 ssh -o "StrictHostKeyChecking=no" $2@$1 sshpass -p $3 sudo service lte stop
sleep 2
sshpass -p $3 ssh -o "StrictHostKeyChecking=no" $2@$1 sshpass -p $3 sudo /root/getRFinfo.sh
sshpass -p $3 ssh -o "StrictHostKeyChecking=no" $2@$1 sshpass -p $3 sudo cat /root/.sdr_check_result.txt >.sdr_check_result.txt
cat .sdr_check_result.txt

echo --------------------------------------------------------------------------------------------------------------------
