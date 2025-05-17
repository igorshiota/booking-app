import React, { useEffect, useState } from "react";
import ServiceList from "../components/ServiceList";
import Cart from "../components/Cart";
import Notification from "./Notification";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Home = () => {
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const ref = doc(db, "settings", "branding");
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    };
    fetchSettings();
  }, []);

  const addToCart = (service, provider, timeSlot) => {
    if (cart.some((item) => item.id === service.id && item.provider.id === provider.id && item.timeSlot === timeSlot)) {
      setNotification("This service with the selected provider and time has already been added to the cart.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }
    setCart([...cart, { ...service, provider, timeSlot }]);
  };

  const backgroundStyle = {
    backgroundImage: settings?.backgroundUrl
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${settings.backgroundUrl})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  return (
    <div className="app-container" style={{ ...styles.container, ...backgroundStyle }}>
      <div style={styles.logoContainer}>
        <img
          src={settings?.logoUrl || "/default_logo.png"}
          alt="Business Logo"
          style={styles.logo}
        />
      </div>

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
  },
  logoContainer: {
    marginBottom: "20px",
  },
  logo: {
    maxWidth: "300px",
    height: "auto",
  },
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
