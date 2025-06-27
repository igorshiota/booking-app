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
      const ref = doc(db, "businessSettings", "branding");
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings(data);

        // Load heading font
        if (data.headingFont) {
          const link = document.createElement("link");
          link.href = data.headingFont;
          link.rel = "stylesheet";
          link.setAttribute("data-font", "headingFont");
          document.head.appendChild(link);
        }

        // Load body font
        if (data.bodyFont) {
          const link = document.createElement("link");
          link.href = data.bodyFont;
          link.rel = "stylesheet";
          link.setAttribute("data-font", "bodyFont");
          document.head.appendChild(link);
        }
      }
    };

    fetchSettings();

    return () => {
      // Clean up any previously added font links
      ["headingFont", "bodyFont"].forEach((id) => {
        const existing = document.querySelector(`link[data-font="${id}"]`);
        if (existing) document.head.removeChild(existing);
      });
    };
  }, []);

  const addToCart = (service, provider, timeSlot) => {
    if (
      cart.some(
        (item) =>
          item.id === service.id &&
          item.provider.id === provider.id &&
          item.timeSlot === timeSlot
      )
    ) {
      setNotification(
        "This service with the selected provider and time has already been added to the cart."
      );
      setTimeout(() => setNotification(""), 2000);
      return;
    }
    setCart([...cart, { ...service, provider, timeSlot }]);
  };

  const backgroundStyle = {
    backgroundImage: settings?.bgImageUrl
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${settings.bgImageUrl})`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  const styles = {
    container: {
      fontFamily: settings?.bodyFontFamily || "'Segoe UI', sans-serif",
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
      fontFamily: settings?.bodyFontFamily || "'Segoe UI', sans-serif",
    },
    heading: {
      fontFamily: settings?.headingFontFamily || "'Segoe UI', sans-serif",
      fontSize: "28px",
      marginBottom: "15px",
    },
  };

  return (
    <div className="app-container" style={{ ...styles.container, ...backgroundStyle }}>
      <div style={styles.logoContainer}>
        <img
          src={settings?.logoUrl || "/images/default-logo.png"}
          alt="Business Logo"
          style={styles.logo}
        />
      </div>

      {/* <h2 style={styles.heading}>Book Your Appointment</h2> */}

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

export default Home;
