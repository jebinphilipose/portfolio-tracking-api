# Portfolio Tracking API

A portfolio tracking API which allows adding/deleting/updating trades and can do basic return calculations. It is hosted on [heroku](https://portfolio-tracking-api.herokuapp.com/). API Documentation can be found [here](https://documenter.getpostman.com/view/3899486/SVmtxKT6)

## Tools/Frameworks Used

* Node.js
* Express
* MongoDB
* Mongoose ODM

## Features

* **ES6+** Support
* **Docker** Support
* Request validation using **Joi**
* Basic request logging with **Morgan**
* Automatic linting with pre-commit hook using **ESLint + Husky**
* Useful Express middlewares like **Helmet**, **CORS** and **Compression**
* API Documentation with **Postman**

## Installation

Install Node.js in your machine and run the following commands:

* Clone this repo: `git clone https://github.com/jebinphilipose/portfolio-tracking-api.git`
* Change working directory: `cd portfolio-tracking-api`
* Install dependencies: `npm install`
* Edit `.env.example` to change values and setup environment variables: `cp .env.example .env && export $(cat .env)`
* Start the server: `npm run dev`
* visit `http://localhost:3000/`

Note:

* If you are building a Docker image, don't forget to pass environment variables to `docker run` command
* To check for linting errors and fix automatically, run: `npm run lint`

## How to use this API

* Start off with placing some trades
* Check for holdings and portfolio
* Know your returns

Note: To know more about the endpoints, check the documentation [here](https://documenter.getpostman.com/view/3899486/SVmtxKT6)

## Design Decisions

* Project structure is designed following **MVC pattern**
* Separate functionalities have been moved out to their respective **modules** which makes testing easier and enables reusability of code
* **Node.js Best practices** have been considered like using environment variables, setting up security headers using Helmet, compression of response body using Compression, running Node.js as a non-root user on production, using Airbnb style guide etc.
* **Error handling** is done properly using a middleware
* **Asyncronous code** with newer Javascript features like `async/await`
* Used **ES6 features** like `const` and `let` for variables declaration, `arrow functions`, `template strings`, higher order function like `map` and `reduce` etc
* All **edge cases** have been thought (like not allowing to sell trades when insufficient quantity, trade ID not found etc.) and 400 is sent while making a bad request
* **Validation** is done both in request level (using Joi) and DB level (using Mongoose validation)
* **REST API Best practices** have been considered like using proper HTTP verbs (GET, POST, PUT, DELETE) and status codes (200, 201, 400, 404, 500)
* **Code quality** is maintained by using appropriate comments, linting (ESLint + Husky), and repeating tasks have been moved out into separate functions for reusability and avoiding duplicate code

## Possible Improvements which can be done

* Advanced logging can be setup using (Morgan + Winston) and logs can be saved to a file using Winston's file transport
* App can be managed by a process manager like `pm2` to automatically restart on failures on production
* Support for clustering can be added to improve performance and reliability
* Unit Testing can be done using `Jest` and Integration Testing using `supertest`
* Token based Authentication can be added using `JWT`
* API Versioning can be added
* Adding pagination could be useful
* Rate limiting can be added to prevent abuse
* Can extend to multiple users with User Authentication