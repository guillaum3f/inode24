#!/bin/bash

ROLES="$(JSON.sh -n < ../../config.json | grep -i 'roles'| awk -F ',' 'END { print $0 }' | awk -F '{|}' '{ print $2 }' | awk -F ',' '
BEGIN { FS = ":|," }
{ 
for (i=1;i<=NF;i++) {
    gsub(/"/, "", $i);
    if(i%2) {
        a=toupper($i)
    } else {
        #print a" : "$i
        system("echo \""$i"->"a"\"");
        system("sed -i \"s/"a"/"$i"/g\" ../subserv/ldap-serv/LDIF/*.ldif");
    }
}
}')"


echo $ROLES

