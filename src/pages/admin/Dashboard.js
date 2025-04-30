import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust the import to your Firebase config

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    serviceId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch services and staff data on page load
    const fetchData = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const staffSnapshot = await getDocs(collection(db, "providers"));

        const servicesData = servicesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        const staffData = staffSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        setServices(servicesData);
        setStaff(staffData);
      } catch (err) {
        setError("Failed to fetch data.");
      }
    };

    fetchData();
  }, []);

  // Add new service
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "services"), newService);
      setServices([...services, newService]);
      setNewService({ name: "", description: "", duration: "", price: "" });
    } catch (err) {
      setError("Failed to add service.");
    }
  };

  // Add new staff member
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "providers"), newStaff);
      setStaff([...staff, newStaff]);
      setNewStaff({ name: "", serviceId: "" });
    } catch (err) {
      setError("Failed to add staff member.");
    }
  };

  // Delete a service
  const handleDeleteService = async (id) => {
    try {
      await deleteDoc(doc(db, "services", id));
      setServices(services.filter(service => service.id !== id));
    } catch (err) {
      setError("Failed to delete service.");
    }
  };

  // Delete a staff member
  const handleDeleteStaff = async (id) => {
    try {
      await deleteDoc(doc(db, "providers", id));
      setStaff(staff.filter(member => member.id !== id));
    } catch (err) {
      setError("Failed to delete staff member.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.columns}>
        <div style={styles.column}>
          <h3>Manage Services</h3>
          <form onSubmit={handleAddService} style={styles.form}>
            <input
              type="text"
              placeholder="Service Name"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Duration (in minutes)"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Add Service</button>
          </form>
          <ul style={styles.list}>
            {services.map((service) => (
              <li key={service.id} style={styles.listItem}>
                <span>{service.name} - ${service.price}</span>
                <button onClick={() => handleDeleteService(service.id)} style={styles.deleteButton}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.column}>
          <h3>Manage Staff</h3>
          <form onSubmit={handleAddStaff} style={styles.form}>
            <input
              type="text"
              placeholder="Staff Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Assigned Service ID"
              value={newStaff.serviceId}
              onChange={(e) => setNewStaff({ ...newStaff, serviceId: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Add Staff</button>
          </form>
          <ul style={styles.list}>
            {staff.map((member) => (
              <li key={member.id} style={styles.listItem}>
                <span>{member.name}</span>
                <button onClick={() => handleDeleteStaff(member.id)} style={styles.deleteButton}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  columns: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  column: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  list: {
    listStyleType: "none",
    padding: "0",
  },
  listItem: {
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  updateButton: {
    backgroundColor: "#f39c12",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    marginTop: "10px",
    color: "red",
    fontSize: "14px",
  },
};
