import React, { useState } from "react";
import ServiceList from "../components/ServiceList";
import Cart from "../components/Cart";
import Notification from "./Notification";
import logo from "../images/nuig_logo.png"; 

const Home = () => {
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const addToCart = (service, provider, timeSlot) => {
    // Check if the combination of service, provider, and time slot already exists
    if (cart.some((item) => item.id === service.id && item.provider.id === provider.id && item.timeSlot === timeSlot)) {
      setNotification("This service with the selected provider and time has already been added to the cart.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }

    setCart([...cart, { ...service, provider, timeSlot }]);
  };

  return (
    <div className="app-container" style={styles.container}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <img src={logo} alt="Business Logo" style={styles.logo} />
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <ServiceList 
            addToCart={addToCart} 
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            cart={cart}
            setCart={setCart}
          />
        </div>
        <div style={styles.card}>
          <Cart cart={cart} />
        </div>
      </div>

      {/* Notification */}
      {notification && <Notification message={notification} />}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  logoContainer: { marginBottom: "20px" },
  logo: { width: "120px", height: "auto" },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "30px",
  },
  card: {
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    background: "#fff",
    width: "100%",
    maxWidth: "480px",
    textAlign: "left",
  },
};


export default Home;
