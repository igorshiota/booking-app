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
    <div className="service-list">
      <h2>Select a Service</h2>
      <div className="service-cards">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-info">
              <h3>{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <p className="service-price">${service.price}</p>
              <p className="service-duration">Duration: {service.duration} minutes</p>
            </div>
            <button
              onClick={() => handleServiceSelection(service)}
              className={`select-button ${selectedService?.id === service.id ? "selected" : ""}`}
              disabled={cart.some(
                (item) => item.id === service.id && item.provider?.id === selectedProvider?.id && item.timeSlot === selectedTime
              )}
            >
              {selectedService?.id === service.id ? "Deselect" : "Select Service"}
            </button>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="provider-selection">
          <h3>Select a Provider for {selectedService.name}</h3>
          <div className="provider-cards">
            {providers[selectedService.id]?.map((provider) => (
              <div key={provider.id} className="provider-card">
                <h4>{provider.name}</h4>
                <button
                  onClick={() => setSelectedProvider(provider)}
                  className={`select-button ${selectedProvider?.id === provider.id ? "selected" : ""}`}
                >
                  {selectedProvider?.id === provider.id ? "Selected" : `Select ${provider.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProvider && (
        <div className="time-selection">
          <h3>Select a Time</h3>
          <div className="time-buttons">
            {selectedProvider.availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`time-button ${selectedTime === time ? "selected" : ""}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedProvider && selectedTime && (
        <div>
          <button onClick={handleAddToCart} className="add-to-cart-button">
            Add to Cart
          </button>
        </div>
      )}
    </div>

    
  );
};

export default ServiceList;
