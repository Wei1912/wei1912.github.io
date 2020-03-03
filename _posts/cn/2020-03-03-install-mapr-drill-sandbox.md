---
title: Install MapR with Drill
---
1. Download MapR Sandbox with Drill  
<a href="https://mapr.com/try-mapr/sandbox/" target="_blank">https://mapr.com/try-mapr/sandbox/</a>

2. Launch VirtualBox, import the downloaded ova file.

3. Start VM.  
user and password for the VM: mapr/mapr  
MapR needs a while to start.

4. UI of Apache Drill  
localhost:8047

5. Query dirll  
show schemas;

6. dbshell  
Login onto VM, run
```bash
mapr dbshell
```

7. sqlline  
Login onto VM, run
```bash
/opt/mapr/drill/drill-{version}/bin/sqlline -u jdbc:drill:drillbit=localhost:31010
```