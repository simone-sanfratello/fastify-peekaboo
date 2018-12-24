#!/usr/bin/env bash

echo "node.js 8 | postgresql 9.4"

# node.js
echo "check node.js";
if dpkg-query -W -f='${Status} ${Version}\n' nodejs; then
    echo "  node.js ok"
else
    echo "  install node.js 8"
    sudo apt update
    sudo apt install curl wget 
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt update
    sudo apt install -y node.js
fi

# postgresql
echo "check postgresql";
if dpkg-query -W -f='${Status} ${Version}\n' postgresql-9.4; then
    echo "  postgresql ok"
else
    echo "  install postgresql 9.4"
    sudo locale-gen en_US en_US.UTF-8
    sudo dpkg-reconfigure locales
    sudo apt-get update
    sudo apt-get install -y postgresql-9.4
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '0.0.0.0'/g" /etc/postgresql/9.4/main/postgresql.conf
    sudo sed -i "s/127.0.0.1\/32/127.0.0.1\/0/g" /etc/postgresql/9.4/main/pg_hba.conf
    sudo service postgresql restart
    sudo su postgres -c "psql -c \"CREATE ROLE developer SUPERUSER LOGIN PASSWORD 'admin-admin?'\" "


    sudo su postgres -c "psql -c \"CREATE DATABASE ${project-name-db} WITH ENCODING='UTF8' OWNER=developer CONNECTION LIMIT=-1;\" "
    sudo su postgres -c "psql -d eollpp -f /vagrant/sys/sql/0-init.sql"
    # node /vagrant/sys/setup/prepare.js dev
fi

# redis ...
