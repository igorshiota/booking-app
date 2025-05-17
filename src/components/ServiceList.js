import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

const ServiceList = ({ addToCart, selectedProvider, setSelectedProvider, selectedTime, setSelectedTime, cart, setCart }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [providers, setProviders] = useState({});

  // Fetch services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCol = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesCol);
        const servicesList = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  // Fetch providers for the selected service
const fetchProviders = async (serviceId) => {
  try {
    const providersCol = collection(db, "providers");
    const providersSnapshot = await getDocs(providersCol);
    const providerList = providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("All Providers:", providerList); 
    console.log("Looking for serviceId:", serviceId); 

    const filteredProviders = providerList.filter(provider => 
      provider.serviceIds && provider.serviceIds.includes(serviceId)
    );

    console.log("Filtered Providers:", filteredProviders); 

    setProviders((prevProviders) => ({
      ...prevProviders,
      [serviceId]: filteredProviders,
    }));
  } catch (error) {
    console.error("Error fetching providers:", error);
  }
};

  
  

  // Fetch providers when a service is selected
  useEffect(() => {
    if (selectedService) {
      fetchProviders(selectedService.id);
    }
  }, [selectedService]);

  const handleServiceSelection = (service) => {
    if (selectedService?.id === service.id) {
      setSelectedService(null);
      setSelectedProvider(null); // Keep provider selection intact 
      setSelectedTime(null); // Keep time selection intact 
    } else {
      setSelectedService(service);
      setSelectedProvider(null);
      setSelectedTime(null);
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedService, selectedProvider, selectedTime);
    setSelectedService(null);
    setSelectedProvider(null);
    setSelectedTime(null);
  };

  return (
    <div className="service-list" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "16px" }}>Select a Service</h2>
  
      <div className="service-cards">
        {services.map((service) => (
          <div key={service.id} style={cardStyle}>
            <div style={infoStyle}>
              <h3 style={{ margin: 0 }}>{service.name}</h3>
              <p style={{ margin: "4px 0", color: "#555" }}>{service.description}</p>
              <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                ${service.price} — {service.duration} mins
              </p>
            </div>
            <button
              onClick={() => handleServiceSelection(service)}
              className={`select-button ${selectedService?.id === service.id ? "selected" : ""}`}
              disabled={cart.some(
                (item) =>
                  item.id === service.id &&
                  item.provider?.id === selectedProvider?.id &&
                  item.timeSlot === selectedTime
              )}
              style={{
                ...buttonStyle,
                backgroundColor:
                  selectedService?.id === service.id ? "#6c757d" : "#007bff",
              }}
            >
              {selectedService?.id === service.id ? "Deselect" : "Select"}
            </button>
          </div>
        ))}
      </div>
  
      {selectedService && (
        <div className="provider-selection" style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "12px" }}>Choose a Provider</h3>
          <div style={providerGrid}>
            {providers[selectedService.id]?.map((provider) => (
              <div key={provider.id} style={providerCardStyle}>
                <span>{provider.name}</span>
                <button
                  onClick={() => setSelectedProvider(provider)}
                  className={`select-button ${selectedProvider?.id === provider.id ? "selected" : ""}`}
                  style={{
                    ...smallButtonStyle,
                    backgroundColor:
                      selectedProvider?.id === provider.id ? "#6c757d" : "#007bff",
                  }}
                >
                  {selectedProvider?.id === provider.id ? "Selected" : "Select"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {selectedProvider && (
        <div className="time-selection" style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "12px" }}>Choose a Time</h3>
          <div style={timeGrid}>
            {selectedProvider.availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`time-button ${selectedTime === time ? "selected" : ""}`}
                style={{
                  ...timeButtonStyle,
                  backgroundColor: selectedTime === time ? "#007bff" : "#f5f5f5",
                  color: selectedTime === time ? "#fff" : "#333",
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
  
      {selectedProvider && selectedTime && (
        <div style={{ marginTop: "24px" }}>
          <button onClick={handleAddToCart} style={addToCartStyle}>
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
  
  
}
const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center", // fix vertical alignment
  padding: "12px 16px",
  marginBottom: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  backgroundColor: "#fff",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  flexWrap: "wrap", // Prevent overflow on smaller screens
};

const infoStyle = {
  flexGrow: 1,
  marginRight: "16px",
  minWidth: 0, // allows content to shrink naturally
};

const buttonStyle = {
  padding: "8px 14px",
  maxWidth: "30%",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontSize: "0.9rem",
  alignSelf: "flex-end", // Align the button to the right
  flexShrink: 0, // Prevents shrinking on small screens
  marginTop: "8px", // Adds some space from the bottom
};

const providerGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const providerCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "#fafafa",
  flexDirection: "row", // Ensure the provider name and button are in line
  gap: "8px", // Space between provider name and button
};

const smallButtonStyle = {
  ...buttonStyle,
  padding: "6px 12px",
  fontSize: "0.85rem",
  alignSelf: "flex-end", // Align to the right within the provider card
  marginTop: "4px", // Adds spacing for visual clarity
};

const timeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
  gap: "10px",
};

const timeButtonStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontSize: "0.9rem",
};

const addToCartStyle = {
  padding: "12px 20px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#28a745",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};



export default ServiceList;
