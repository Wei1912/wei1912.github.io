---
title: VirtualBox 虚拟机的网络配置
---
在VirtualBox搭建完成虚拟机以后，可以为其添加/删除虚拟网卡。VirtualBox提供多种模式的虚拟网卡。
在Virtualbox的官网有对于各种网卡模式的详细介绍。  
<a href="https://www.virtualbox.org/manual/ch06.html" target="_blank">Chapter 6. Virtual Networking</a>

个人在配置虚拟机网络时，通常会设置两个网卡。
一个是 NAT 模式，这个用来连接外部网络（互联网），并且VirtualBox在创建虚拟机时会自动创建该模式的网卡。
另一个是 Host-only 模式，通过这个网卡，各个虚拟机之间，包括主机，都可以通信。
接下来详细介绍这两种模式的网卡和配置方法。

## NAT

NAT 是 Network Address Translation 的缩写。  
VirtualBox NAT 引擎在接收到虚拟机发送的（数据链路层）数据帧之后，解析出其中的 TCP/IP 数据包，然后通过主机的操作系统来重新发送这个包。也就是说，从外部来看，这个数据包实际上是由一个运行在主机系统上的软件（VirtualBox）发送的，使用主机的IP地址和端口（主机会为其随机分配一个端口）。  
在接收到外部网络的 response 之后，同样的，VirtualBox NAT 引擎会将数据包转送给对应的虚拟机。
通过这样的网络地址转换，虚拟机就实现了和外界通信。不过通过这种模式，只能由虚拟机主动发起请求，而不能作为服务器向外部网络提供服务。  
NAT是VirtualBox创建虚拟机的默认网络模式，通常不需要再加以设定/更改。  
VirtualBox默认为该网络接口分配 10 开头的内网IP。
![NAT](/assets/images/virtualbox-conf-network-01.png){:width="600px"}

## Host-only

在该模式下，VirtualBox 会在主机创建一个虚拟网卡，这块网卡实际上是一个 loopback 接口，因而虚拟机不能通过该模式访问外部网络。  
在选择该模式前，需要先创建一个主机上的虚拟网卡。打开 VirtualBox，选择 File -> Host Network Manager ，点击 Create 创建网卡。
![NAT](/assets/images/virtualbox-conf-network-03.png){:width="600px"}

根据需要可以更改默认设置，比如 IP 地址。在这个例子，IP 地址是默认的 192.168.56.1。  
那么这个地址就是主机的IP地址，同时也是使用该虚拟网卡的各虚拟机的网关。  
因为子网掩码是 255.255.255.0，所以之后应该给各虚拟机配置 192.168.56 网段的地址，192.168.56.x

#### 虚拟机的网络设置
![NAT](/assets/images/virtualbox-conf-network-02.png){:width="600px"}

#### 虚拟机操作系统的网络设置
（Ubuntu 18.04 操作系统）

1\. 查看可用网络接口（network interfaces）  
运行 ip addr 命令
```bash
$ ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 08:00:27:14:3c:81 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic enp0s3
       valid_lft 86372sec preferred_lft 86372sec
    inet6 fe80::a00:27ff:fe14:3c81/64 scope link 
       valid_lft forever preferred_lft forever
3: enp0s8: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
    link/ether 08:00:27:88:bc:91 brd ff:ff:ff:ff:ff:ff
```
可以看到 lookback 网络接口 lo，NAT网络接口 enp0s3，而 enp0s8 就是 Host-only 的网络接口了。
下面为其指定一个固定IP，192.168.56.20

2\. 编辑 /etc/netplan/50-cloud-init.yaml 文件  
Ubuntu18使用 netplan 工具来配置网络。使用 netplan 可以用 YMAL 来方便地设定网络配置。在 VirtualBox 虚拟机，Ubuntu 自动在 /etc/netplan 目录下生成 50-cloud-init.yaml 文件，编辑该文件即可。
```
# This file is generated from information provided by
# the datasource.  Changes to it will not persist across an instance.
# To disable cloud-init's network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    version: 2
    ethernets:
        enp0s3:
            dhcp4: true
        enp0s8:
            dhcp4: no
            addresses: [192.168.56.20/24]
```
注意 enp0s8 部分，这就是我们需要添加的关于 Host-only 网络接口的配置。

3\. 然后运行以下命令使其生效。
```bash
$ sudo netplan apply
```
<br>
注意，在 enp0s8 中不要设置网关，比如 gateway4: 192.168.56.1  
如果设置了网关就会导致 NAT 网络接口无法正常连接外部网络。这可能是 netplan，Ubuntu 或者 VirtualBox 的一个 Bug。
参看
<a href="https://askubuntu.com/questions/984445/netplan-configuration-on-ubuntu-17-04-virtual-machine" target="_blank">netplan configuration on Ubuntu 17.04 virtual machine</a>

4\. 确认网络配置。
```bash
$ ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 08:00:27:14:3c:81 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic enp0s3
       valid_lft 86314sec preferred_lft 86314sec
    inet6 fe80::a00:27ff:fe14:3c81/64 scope link 
       valid_lft forever preferred_lft forever
3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 08:00:27:88:bc:91 brd ff:ff:ff:ff:ff:ff
    inet 192.168.56.20/24 brd 192.168.56.255 scope global enp0s8
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fe88:bc91/64 scope link 
       valid_lft forever preferred_lft forever
```
可以看到 enp0s8 的 IP 变成了 192.168.56.20

&lt;END&gt;
