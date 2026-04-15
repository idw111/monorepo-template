#!/bin/bash
# script to initialize aws ec2 instance
su - ec2-user -c "sudo yum update -y"
su - ec2-user -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
su - ec2-user -c ". ~/.nvm/nvm.sh"
su - ec2-user -c "nvm install v16.13.0"
su - ec2-user -c "node -e \"console.log('Running Node.js ' + process.version)\""
su - ec2-user -c "echo \"alias tailcd='tail -f /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log'\" >> /home/ec2-user/.bashrc"
su - ec2-user -c "echo \"alias vicd='vi /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log'\" >> /home/ec2-user/.bashrc"
su - ec2-user -c "source ~/.bashrc"
su - ec2-user -c "printf \"ZONE='Asia/Seoul'\nUTC=true\" | sudo tee /etc/sysconfig/clock"
su - ec2-user -c "sudo ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime"
su - ec2-user -c "date"
