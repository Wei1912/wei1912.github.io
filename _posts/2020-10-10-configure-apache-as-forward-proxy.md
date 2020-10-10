---
title: Configure Apache as a forward proxy
---
This article tells how to configure Apache as a forward proxy on Ubuntu 20.04 LTS.

## Install Apache
```bash
sudo apt update
sudo apt install apache2
```
Then check status of Apache service.
```bash
sudo systemctl status apache2
```

## Configure Apache

#### 1. Enable proxy, proxy_http, and proxy_connect modules
```bash
sudo a2enmod proxy proxy_http proxy_connect
```

#### 2. Use Apache as a forward proxy
Edit /etc/apache2/mods-available/proxy.conf
<br />
Uncomment **ProxyRequests On** line and **Proxy** block.
```bash
<IfModule mod_proxy.c>

        # If you want to use apache2 as a forward proxy, uncomment the
        # 'ProxyRequests On' line and the <Proxy *> block below.
        # WARNING: Be careful to restrict access inside the <Proxy *> block.
        # Open proxy servers are dangerous both to your network and to the
        # Internet at large.
        #
        # If you only want to use apache2 as a reverse proxy/gateway in
        # front of some web application server, you DON'T need
        # 'ProxyRequests On'.

        ProxyRequests On
        <Proxy *>
           AddDefaultCharset off
           Require all denied
           #Require local
        </Proxy>

        # Enable/disable the handling of HTTP/1.1 "Via:" headers.
        # ("Full" adds the server version; "Block" removes all outgoing Via: headers)
        # Set to one of: Off | On | Full | Block
        #ProxyVia Off

</IfModule>
```

#### 3. Configure forward proxy
Navigate to /etc/apache2/sites-available, create a new file called **forward-proxy.conf**, <br />
You can copy existing 000-default.conf and name it to forward-proxy.conf
```bash
<VirtualHost *:8080>

        ProxyRequests On
        ProxyVia On

        ErrorLog ${APACHE_LOG_DIR}/forward_proxy_error.log
        CustomLog ${APACHE_LOG_DIR}/forward_proxy_access.log combined

        <Proxy "*">
                Require all granted
        </Proxy>

</VirtualHost>
```

As we set the port of proxy to 8080, we need let Apache to listen this port.<br />
Edit /etc/apache2/ports.conf and add **Listen 8080**

```bash
Listen 80
Listen 8080

<IfModule ssl_module>
        Listen 443
</IfModule>

<IfModule mod_gnutls.c>
        Listen 443
</IfModule>
```

#### 4. Enable forward proxy
```bash
sudo a2ensite forward-proxy.conf
sudo systemctl reload apache2
```

We can check "forward_proxy_error.log" and "forward_proxy_access.log" under **/var/log/apache2** directory.

## Other configuration

### Require
"Require all granted" lets any client to access the proxy.<br />
You can control we can access the proxy by specifying "Require ip xxx" or "Require host yyy".

### Block a site
```bash
ProxyBlock "xx.yy.com"
```
<a href="https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxyblock" target="_blank">ProxyBlock Directive</a>

### Basic authentication
<a href="https://httpd.apache.org/docs/2.4/howto/auth.html" target="_blank">Authentication and Authorization</a>
<br />
<a href="https://cwiki.apache.org/confluence/display/HTTPD/PasswordBasicAuth" target="_blank">PasswordBasicAuth</a>

##### 1. Create a password file
Following command creates a password file and add a user (user1) to it.
```bash
# the path of password file could be arbitrary.
sudo htpasswd -c /etc/apache2/userpass user1
```
htpasswd will ask you for the password.<br />
Add another user.
```bash
sudo htpasswd /etc/apache2/userpass user2
```

##### 2. Set up basic authentication
Modify **Proxy** block of **forward-proxy.conf** like below.
```bash
<Proxy "*">
        AuthType Basic
        AuthName "Authentication Required"
        AuthBasicProvider file
        AuthUserFile "/etc/apache2/userpass"
        Require valid-user
</Proxy>
```

&lt;END&gt;
