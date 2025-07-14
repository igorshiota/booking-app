import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const Cart = ({ cart }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalDuration = cart.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);

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
        orders: cart.map(item =>
          `${item.name} with ${item.provider.name} at ${item.timeSlot} — $${item.price}`
        ).join("\n"),
        total_duration: totalDuration,
        cost_total: totalPrice
     };

     console.log("Sending templateParams:", templateParams);


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
        <div key={index} style={{ marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
          <p><strong>{item.name}</strong> with {item.provider.name} at {item.timeSlot}</p>
          <p style={{ color: "#666" }}>${item.price} for {item.duration} minutes</p>
        </div>
      ))}

      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ccc" }}>
        <h3>Summary</h3>
        <p><strong>Duration:</strong> {totalDuration} mins</p>
        <p><strong>Total:</strong> ${totalPrice}</p>
      </div>

      <form onSubmit={handleBooking} style={{ marginTop: "2rem" }}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={submitStyle}>Book Now</button>
        {status && <p style={{ marginTop: "1rem", color: status.includes("confirmed") ? "green" : "red" }}>{status}</p>}
      </form>
    </>
  )}
</div>


  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const submitStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};


export default Cart;
