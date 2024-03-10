
# Ordering Sharing System Management

The project consists of designing and implementing an online order management system, where a
customer (end user) can choose, order, and pay for his selection from a catalog of products.
Let’s take the example of a group of friends going out for a Bowling gathering. Every person can
select drinks, snacks, or desserts using his/her own smartphone, and at the end, one person can pay
for all, or each person can pay his/her own order, or part of the order.





## Tech Stack

**Server:** Express & Prisma


## Run Locally

Clone the project

```bash
  git clone https://github.com/ZvSimon/Software-Architectures-Project.git
```

Go to the project directory 

Then, go on eache folder :

```bash
  cd folder
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run prisma 
```
```bash
  npm start
```




## Features

- Login/Register with Token generation
- Product Service : You can post,delete,put and get products.
- Order Service : You can create an order, after a QrCode is generate. If the Qrcode is the same, then you can join the order.
- Payment Service : You can as people want. When the command is completed, we erase the order & we send a email to confirm that evrything has been paid & how much they paid. 

