---
title: Create a self-signed SSL certificate with SAN for Tableau products
---
This article tells how to using OpenSSL create a self-signed SSL certificate with SAN that works for Tableau products.

1. Create file san.cnf with following content.<br />
Replace all &lt;&gt; items with proper values.
```
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no
[req_distinguished_name]
C = <Country Name (2 letter code)>
ST = <State or Province Name>
L = <Locality Name (eg, city)>
O = <Organization Name (eg, company)>
OU = <Organizational Unit>
CN = <Common Name (hostname or IP)>
[v3_req]
subjectAltName = @alt_names
[alt_names]
DNS.1 = <hostname1>
DNS.2 = <hostname2>
```
Replace alt_names with below if you want to use IP as SAN.
```
[alt_names]
IP = <IP>
```

2. Run following command.<br />
Replace xxx with meaningfull strings.
```bash
openssl req -x509 -sha256 -days 3650 -nodes -newkey rsa:4096 -keyout xxx.key -out xxx.crt -config san.cnf
```
This command will generate 2 files, xxx.key and xxx.crt.

3. Configure SSL for Tableau Server.<br />
You will use the crt and key files generated in above step.<br />
Tableau Online help:<br />
<a href="https://help.tableau.com/current/server/en-us/ssl_config.htm" target="_blank">for Windows</a><br />
<a href="https://help.tableau.com/current/server-linux/en-us/ssl_config.htm" target="_blank">for Linux</a>

4. Install the certificate (xxx.crt) on your local computer.<br />
Install certificate to **Trusted Root Certification Authorities** store of **Current User** or **Local Computer**.

5. Launch Tableau Desktop or Tableau Prep Builder then sign in to Tableau Server.

&lt;END&gt;
