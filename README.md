# Express-Shop

This is a web application built with Node.js that simulates an online shop. The application allows users to browse through various products, add products to their cart, checkout to complete their purchases, and also put up for sale their own items.

Technologies used in this project include:

* Node.js
* Express.js
* MongoDB
* Mongoose
* EJS template 


## Quickstart / Installation

To run the application locally, you will need to have [Node.js](https://nodejs.org/en) and [MongoDB](https://www.mongodb.com/) installed on your machine.

1. Clone this repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Configure your Mongo database, make sure it includes the following collections:
   * orders
   * products
   * session
   * users

4. Create a `.env` file in the root directory of the project and add the following environment variables:
   ```bash
   MONGO_USER=<your-user>
   MONGO_PASSWORD=<your-password>
   MONGO_DEFAULT_DATABASE=express-shop
   STRIPE_KEY=<your-stripe-key>
   PORT=3000
   ```

5. Start the application:
   ```bash
   npm run start:dev
   ```
   or
   ```bash
   npm run start
   ```

To be sure that the installation succeeded, just open the following URL in your favorite browser: [localhost:3000](http://localhost:3000/)

## Usage

### Main Page
When you first open the application, you will see a list of products that are available for purchase. You can add them to your "Favorites".

### Browsing Products
To see additional information click on "Details" button on any of these products to view more details about them.

### Sign Up / Sign In
To access the full functionality of the store, register by clicking the button in the upper right corner of the screen. To the left of it there is an authorization button. If you have forgotten your password, click the appropriate button on the "Login" tab and follow the instructions in the mail.

### Adding Products to Cart
To add a product to your cart, simply click the "Add to Cart" button on the product page. You can then view your cart by clicking on the "Cart" tab at the top of the page.

### Checking Out
To complete your purchase, navigate to your cart and click the "Order Now" button. You will be prompted to enter your shipping information and payment details.

### Add Product
To add a product, fill in all the necessary information about it, including a photo of the product itself, on the "Add product" tab. It will appear in your products on the "Admin Products" tab.

### Admin Panel
The application also includes an admin panel, which allows you to edit and delete products. To access the admin panel, navigate to "Admin Products" tab.


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.


## License

[ISC](https://github.com/SamVitalii/express-shop/blob/main/LICENSE)
