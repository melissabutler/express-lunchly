/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** Search db for like- search term */
  static async search(input) {
    let search = `${input}%`
    const results = await db.query(
      `SELECT first_name as "firstName",
      last_name AS "lastName"
      FROM customers
      WHERE first_name LIKE $1 OR last_name LIKE $1
      ORDER BY last_name, first_name`,
      [search]
    );
    return results.rows.map(c => new Customer(c))
  }

  /** Get best customers */
  static async getBest() {
    const top10Ids = await db.query(
      `SELECT customer_id
      FROM reservations 
      GROUP BY customer_id
      ORDER BY COUNT(*) DESC
      LIMIT 10`
    );
    let customers = top10Ids.rows.map(c => await Customer.get(c.customer_id))
    console.log(customers)


    
  }
  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

/** get full name of customer */
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}
}

module.exports = Customer;
