import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const Cart = ({ cart }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalDuration = cart.reduce((sum, item) => sum + (item.duration || 0), 0);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      setStatus("Please fill in both name and email.");
      return;
    }

    // Prepare cart summary for email
    const serviceList = cart.map(
      item => `${item.name} with ${item.provider.name} at ${item.timeSlot} ($${item.price})`
    ).join("\n");

    const templateParams = {
      user_name: name,
      user_email: email,
      message: serviceList,
      total_price: totalPrice,
      total_duration: totalDuration,
      to_email: `${email}, igor.shiota@gmail.com`,
    };

    try {
      await emailjs.send(
        "service_xuk2j3f",     // EmailJS service ID
        "template_vm9it3p",    // EmailJS template ID
        templateParams,
        "Kekp5OpWnJoA4sP2Q"      // EmailJS public key
      );
      setStatus("Booking confirmed! Check your email.");
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Email sending error:", error);
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="cart">
      <h2>Cart</h2>

      {cart.length === 0 ? (
        <p>No services added.</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <p>
                <strong>{item.name}</strong> — {item.provider.name} at {item.timeSlot}
              </p>
              <p>
                <small>
                  ${item.price} for {item.duration} minutes
                </small>
              </p>
            </div>
          ))}

          {/* Summary section */}
          <div className="cart-summary" style={{ marginTop: "1rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
            <h3>Summary</h3>
            <p><strong>Total Duration:</strong> {totalDuration} minutes</p>
            <p><strong>Total Cost:</strong> ${totalPrice}</p>
          </div>

          {/* Booking Form */}
          <div className="booking-form" style={{ marginTop: "2rem" }}>
            <h3>Complete your Booking</h3>
            <form onSubmit={handleBooking}>
              <div>
                <label>Name:</label><br />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
                />
              </div>
              <div>
                <label>Email:</label><br />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
                />
              </div>
              <button type="submit" style={{ padding: "10px 20px" }}>
                Book Now
              </button>
            </form>
            {status && <p style={{ marginTop: "1rem", color: status.includes("confirmed") ? "green" : "red" }}>{status}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
