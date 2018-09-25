# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # https://docs.vagrantup.com.
    config.vm.box = "debian/jessie64"
  
  # config.vm.network "forwarded_port", guest: 5432, host: 5432
  # config.vm.network "private_network", ip: "192.168.33.10"
  # config.vm.network "public_network"

  config.vm.synced_folder "./", "/vagrant"

  config.vm.provider "virtualbox" do |vb|
     # Display the VirtualBox GUI when booting the machine
     vb.gui = false
     vb.name = "fastify-peekaboo"

     # Customize the amount of memory on the VM:
     vb.memory = 1024
     vb.cpus = 2
   end

   config.vm.provision :shell, path: ".vagrant-conf/bootstrap.sh"
end
