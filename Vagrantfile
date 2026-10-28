Vagrant.configure("2") do |config|
  config.vm.hostname = "portfolio-vm"
  config.vm.provider "docker" do |d|
    d.build_dir = "."
    d.dockerfile = "Dockerfile.vagrant"
    d.has_ssh = true
    d.name = "portfolio-vm"
    d.volumes = ["/var/run/docker.sock:/var/run/docker.sock"]
  end
  config.ssh.username = "root"
  config.ssh.private_key_path = "vagrant_key"
  config.ssh.insert_key = false

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "ansible/site.yml"
  end
end
