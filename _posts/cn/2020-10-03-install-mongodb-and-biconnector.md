---
title: 安装 MongoDB 和 MongoDB Connector for BI
---
MongoDB 是一种面向文档的数据库管理系统。<br />
MongoDB 以 BSON 格式保存和传输数据，但是基本上我们可以认为 MongoDB 是以 JSON 格式存储数据的。<br />
BSON，Binary JSON，is a bin­ary-en­coded seri­al­iz­a­tion of JSON-like doc­u­ments.

## 概念
MongoDB 和传统的关系型数据库不一样，所使用的术语或者说概念也不一样。<br />
简单来说，没有 table，对应的是 collection (集合)。<br />
没有 row，对应的是 document (文档)。

## 安装 MongoDB
MongoDB 提供了免费的社区版本。<br />
并且提供了详细的安装方法。参看 
<a href="https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials" target="_blank">MongoDB Community Edition Installation Tutorials</a><br />

下面这个文档详细介绍了如何在 Ubuntu 上安装免费社区版 MongoDB<br />
<a href="https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/" target="_blank">Install MongoDB Community Edition on Ubuntu</a>

## 使用 MongoDB
安装过程其实很简单。我们再来看看基本操作方法。<br />
安装完成后，我们可以使用 mongo 工具来操作数据库。
#### 1. 启动 mongo
```bash
mongo
```
不带选项/参数的情况下，它会自动去连本机的 27017 端口，这也是 MongoDB 的默认端口。

#### 2. 创建数据库
默认情况下，mongo 会链接 test 数据库，我们可以用
```bash
db
```
来查看当前数据库。<br />

用
```bash
show dbs
```
来查看所有的数据库。<br />

用
```bash
use dbname
```
来切换和创建数据库。<br />
当我们往 dbname 里插入数据的时候，如果 dbname 是不存在，那么 MongoDB 就会创建这个数据库。
也就是说，在 use 一个不存在的数据库的时候，MongoDB 并不会立即创建这个数据库，而是等到有数据插入的时候才创建。

#### 3. 插入数据
用
```bash
db.createCollection("collectionName")
```
在数据库里创建一个集合。<br />

用
```bash
show collections
```
来查看当前数据库的所有集合。<br />

用
```bash
db.collectionName.inserOne(document)
```
来向集合里插入一个文档，（可以理解为一条数据）。<br />

用
```bash
db.collectionName.inserMany([document1, document2])
```
来插入多个文档。

## 安装 MongoDB Connector for BI
我们不能直接用 SQL 来查询 MongoDB 数据库，但是 MongoDB 提供了 
<a href="https://docs.mongodb.com/bi-connector/master/" target="_blank">MongoDB Connector for Business Intelligence</a>。
通过这个工具，我们可以用 SQL 来查询 MongoDB 数据库。Tableau 也是通过这个工具来连接 MongoDB 的。<br />

安装 Connector for BI 也是很简单的，参看
<a href="https://docs.mongodb.com/bi-connector/master/installation" target="_blank">Install BI Connector On Premises</a>
<br />
可以参看下面这个文档在 Ubuntu 上安装 Connector for BI.<br />
<a href="https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/" target="_blank">Install MongoDB Community Edition on Ubuntu</a>
<br />

安装完成后，我们需要启动 <a href="https://docs.mongodb.com/bi-connector/master/launch" target="_blank">Launch BI Connector</a>
<br />
另外提一点，我们可以把这个工具安装到 MongoDB 数据库同一个服务器，也可以装到别的地方。

## 从 Tableau Desktop 连接 MongoDB
事实上，是连接到 MongoDB Connector for BI，其默认端口是 3307。
我们注意到，这个端口号很类似 MySQL 的默认端口 3306 ，而事实上，我们需要安装 MySQL 的驱动。

#### 1. 下载并安装最新版本的 MySQL ODBC 驱动
<a href="https://dev.mysql.com/downloads/connector/odbc/" target="_blank">MySQL Community Downloads</a><br />
MySQL ODBC 驱动需要安装在和 Tableau Desktop 同一个机器上。

#### 2. 启动 Tableau Desktop, 并选择 MongoDB BI Connector
![MongoDB BI Connector](/assets/images/connect-td-to-mongodb.png){:width="400px"}

&lt;END&gt;