# 如何在 Ubuntu 18.04 安装 域名服务器

通常我们访问某个网站，是在浏览器中输入这个网站的域名，比如 https://www.google.com/ ，但是在网络中，计算机需要知道其 IP 才可以通信。而域名服务器（Name server）可以进行 域名 和 IP 的转换。  
接下来介绍如何在 Ubuntu 18.04 中安装 BIND9。BIND9 是 BIND 的当前最新版本，而 BIND 是最常使用的 DNS 软件。

## 安装和配置 BIND9
### 更新系统
```bash
sudo apt update
```
### 安装 BIND9
```bash
sudo apt install bind9
```
输入 y 继续安装。
### 配置 BIND9
假设除域名服务器之外我们还有两台电脑，也是安装 Ubuntu 18.04 系统。两台电脑的 IP 分别是  
  电脑A: 192.168.56.10  
  电脑B: 192.168.56.11

现在我想给它们分别赋予如下的域名，  
  电脑A: app1.sample.com  
  电脑B: app2.sample.com  
域名可以随意指定，这里以 sample.com 作为例子。app1 和 app2 是主机名。
#### 1. 配置 named.conf.options

BIND9 的配置文件在 /etc/bind  
所以我们先 cd 到这个目录
```bash
cd /etc/bind
```
ls 这个目录会看到文件 named.conf.options\
用你喜欢的编辑器打开这个文件，比如说
```bash
sudo vi named.conf.options
```
把下面这些设定加入到这个配置文件
```bash
listen-on { localhost; 192.168.56.3; };
allow-transfer { none; };
```
192.168.56.3 是本机（域名服务器）的 IP 地址，BIND9 会监听本机的 53 端口，包括 127.0.0.1:53 和 192.168.56.3:53, 53 是 DNS 服务的默认端口。  
由于我们只有一台域名服务器，没有同步的必要，所以将 allow-transfer 设置为 none。  
编辑之后的样子：
```bash
options {
        directory "/var/cache/bind";

        listen-on { localhost; 192.168.56.3; };
        allow-transfer { none; };
        
        // 以下默认设置
        dnssec-validation auto;

        auth-nxdomain no;    # conform to RFC1035
        listen-on-v6 { any; };
};
```

#### 2. 配置 zone

打开文件 named.conf.local，加入以下设定。
```bash
zone "sample.com" {
        type master;
        file "/etc/bind/zones/db.sample.com";
};

zone "56.168.192.in-addr.arpa" {
        type master;
        file "/etc/bind/zones/db.56.168.192";
};
```
注意最后的 ; 是必须的。
zone "sample.com" 是正向解析用 zone 配置，解析用的数据存储于 /etc/bind/zones/db.sample.com 文件。  
sample.com 是域名，我们将在 db.sample.com 文件加入所有主机和对应的IP信息。

zone "56.168.192.in-addr.arpa" 是反向解析用 zone 配置，我们假设我们的网络号是 192.168.56，注意这里要将其反过来写成 56.168.192.in-addr.arpa。in-addr.arpa 表示这是用于反向解析。解析用的数据存储于 /etc/bind/zones/db.56.168.192 文件。

#### 3. 正向解析 zone 文件

在 /etc/bind 目录下新建 zones 文件夹。  
将 /etc/bind/db.empty 文件复制到 zones 文件夹，并重命名为 db.sample.com  
编辑 db.sample.com 文件：
```bash
$TTL    86400
@       IN      SOA     ns.sample.com. admin.sample.com. (
                              1         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                          86400 )       ; Negative Cache TTL
; name servers - NS records
        IN      NS      ns.sample.com.

; name servers - A records
ns.sample.com.  IN      A       192.168.56.3

; A records
app1    IN      A       192.168.56.10
app2    IN      A       192.168.56.11
```

#### 4. 反向解析 zone 文件

将 /etc/bind/db.empty 文件再次复制到 zones 文件夹，并重命名为 db.56.168.192  
编辑 db.56.168.192 文件：
```bash
$TTL    86400
@       IN      SOA     ns.sample.com. admin.sample.com. (
                              1         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                          86400 )       ; Negative Cache TTL
; Name servers - NS records
        IN      NS      ns.sample.com.

; Name servers - PTR records
3       IN      PTR     ns.sample.com.

; PTR records
10      IN      PTR     app1.sample.com.
11      IN      PTR     app2.sample.com.
```
注意，如果你的网络号是 192.168，那么在 PTR 记录中，应当使用 10.56 这样的记录方式，就是将 IP 反过来。

#### 5. 检查配置

运行以下命令来检查 BIND9 配置文件。
```bash
sudo named-checkconf
```
如果配置有错误，该命令会提示错误信息。  

运行以下命令检查正向解析 zone 文件配置。
```bash
sudo named-checkzone sample.com /etc/bind/zones/db.sample.com
```
named-checkzone 命令后跟两个参数，第一个是检查对象 zone 的名字，第二个是其 zone 文件。  

运行以下命令检查反向解析 zone 文件配置。
```bash
sudo named-checkzone 56.168.192.in-addr.arpa /etc/bind/zones/db.56.168.192
```

检查都通过的话那么配置就完成了。

### 重起 BIND9
在我们安装完 BIND9 后，BIND9 就启动了。  
运行以下命令重起 BIND9 服务，以使配置生效。
```bash
sudo systemctl restart bind9
```
我们可以运行以下命令来查看当前 BIND9 的运行状态。
```bash
sudo systemctl status bind9
```

### 检验效果
通常使用 nslookup 命令来查询DNS记录。  
nslookup 后跟域名的时候，查询 A 记录，输出域名对应的 IP。  
后跟 IP 的时候，查询 PTR 记录，输出 IP 对应的域名。  
nslookup 还可以指定域名服务器。如果不指定的话，将使用系统的域名服务器。  

登陆到电脑A，输入以下命令
```bash
nslookup app2.sample.com
```
由于我们还没有更改 电脑A 的系统域名服务器，所以上面的命令并不能给出正确的结果。  
接下来运行命令 nslookup app2.sample.com 192.168.56.3
```bash
xxx@app1:~$ nslookup app2.sample.com 192.168.56.3
Server:		192.168.56.3
Address:	192.168.56.3#53

Name:	app2.sample.com
Address: 192.168.56.11
```
可以看到，nslookup 向 192.168.56.3 查询 app2.sample.com 的DNS信息并给出了正确的 IP 地址。  
我们也可以查询 PTR 信息。
```bash
xxx@app1:~$ nslookup 192.168.56.10 192.168.56.3
10.56.168.192.in-addr.arpa	name = app1.sample.com.
```

### 更改系统域名服务器设定
配置完域名服务器后，需要在其它的机器上设置DNS服务器信息，这样别的机器才可以使用配置完成的域名服务器的服务。  
在电脑A，打开 /etc/netplan 目录下的配置文件，我是在 VirtualBox 上配置的虚拟机，所以配置文件是 50-cloud-init.yaml  
将域名服务器信息添加到对应的网卡即可。  
![name server setting](/assets/images/install-dns-on-ubuntu18.04-01.png){:width="600px"}

运行 sudo netplan apply 使设定生效。
这时候再执行 nslookup app2.sample.com ，就可以得到想要的结果了。  

END