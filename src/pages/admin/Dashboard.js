import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newService, setNewService] = useState({ name: "", description: "", duration: "", price: "", staff: [] });
  const [newStaff, setNewStaff] = useState({ name: "", availableTimes: [], serviceIds: [] });
  const [availableTimesInput, setAvailableTimesInput] = useState("");

  useEffect(() => {
    fetchServices();
    fetchStaff();
  }, []);

  const fetchServices = async () => {
    const servicesSnapshot = await getDocs(collection(db, "services"));
    const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setServices(servicesList);
  };

  const fetchStaff = async () => {
    const staffSnapshot = await getDocs(collection(db, "providers"));
    const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStaff(staffList);
  };

  const handleAddService = async () => {
    const newServiceDoc = await addDoc(collection(db, "services"), {
      name: newService.name,
      description: newService.description,
      duration: newService.duration,
      price: newService.price,
      staff: newService.staff
    });

    // Update staff documents to include this new service
    for (const staffId of newService.staff) {
      const staffRef = doc(db, "providers", staffId);
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        const updatedServices = staffMember.serviceIds ? [...staffMember.serviceIds, newServiceDoc.id] : [newServiceDoc.id];
        await updateDoc(staffRef, { serviceIds: updatedServices });
      }
    }

    setNewService({ name: "", description: "", duration: "", price: "", staff: [] });
    fetchServices();
    fetchStaff();
  };

  const handleAddStaff = async () => {
    const timesArray = availableTimesInput.split(",").map(time => time.trim());
    const newStaffDoc = await addDoc(collection(db, "providers"), {
      name: newStaff.name,
      availableTimes: timesArray,
      serviceIds: newStaff.serviceIds
    });

    // Update services to include this staff if needed
    for (const serviceId of newStaff.serviceIds) {
      const serviceRef = doc(db, "services", serviceId);
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const updatedStaff = service.staff ? [...service.staff, newStaffDoc.id] : [newStaffDoc.id];
        await updateDoc(serviceRef, { staff: updatedStaff });
      }
    }

    setNewStaff({ name: "", availableTimes: [], serviceIds: [] });
    setAvailableTimesInput("");
    fetchServices();
    fetchStaff();
  };

  const handleStaffCheckboxChange = (staffId) => {
    setNewService(prevState => ({
      ...prevState,
      staff: prevState.staff.includes(staffId)
        ? prevState.staff.filter(id => id !== staffId)
        : [...prevState.staff, staffId]
    }));
  };

  const handleServiceCheckboxChange = (serviceId) => {
    setNewStaff(prevState => ({
      ...prevState,
      serviceIds: prevState.serviceIds.includes(serviceId)
        ? prevState.serviceIds.filter(id => id !== serviceId)
        : [...prevState.serviceIds, serviceId]
    }));
  };

  return (
    <div style={styles.container}>
      <h2>Admin Dashboard</h2>
      <div style={styles.formContainer}>
        {/* Add New Service */}
        <div style={styles.formSection}>
          <h3>Add New Service</h3>
          <input
            type="text"
            placeholder="Service Name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Service Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Service Duration (mins)"
            value={newService.duration}
            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Service Price"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
            style={styles.input}
          />
          <div>
            <h4>Assign Staff</h4>
            {staff.map((member) => (
              <label key={member.id}>
                <input
                  type="checkbox"
                  checked={newService.staff.includes(member.id)}
                  onChange={() => handleStaffCheckboxChange(member.id)}
                />
                {member.name}
              </label>
            ))}
          </div>
          <button onClick={handleAddService} style={styles.button}>Add Service</button>
        </div>

        {/* Add New Staff */}
        <div style={styles.formSection}>
          <h3>Add New Staff</h3>
          <input
            type="text"
            placeholder="Staff Name"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Available Times (comma separated)"
            value={availableTimesInput}
            onChange={(e) => setAvailableTimesInput(e.target.value)}
            style={styles.input}
          />
          <div>
            <h4>Assign Services</h4>
            {services.map((service) => (
              <label key={service.id}>
                <input
                  type="checkbox"
                  checked={newStaff.serviceIds.includes(service.id)}
                  onChange={() => handleServiceCheckboxChange(service.id)}
                />
                {service.name}
              </label>
            ))}
          </div>
          <button onClick={handleAddStaff} style={styles.button}>Add Staff</button>
        </div>
      </div>

      {/* Lists */}
      <div style={styles.listsContainer}>
        {/* Services List */}
        <div style={styles.listSection}>
          <h3>Services</h3>
          {services.map((service) => (
            <div key={service.id} style={styles.card}>
              <h4>{service.name}</h4>
              <p>{service.description}</p>
              <p>Duration: {service.duration} mins</p>
              <p>Price: €{service.price}</p>
              <p>
                Staff:{" "}
                {Array.isArray(service.staff) && service.staff.length > 0
                  ? service.staff.map(staffId => {
                      const staffMember = staff.find(s => s.id === staffId);
                      return staffMember ? staffMember.name : "Unknown";
                    }).join(", ")
                  : "No Staff Assigned"}
              </p>
            </div>
          ))}
        </div>

        {/* Staff List */}
        <div style={styles.listSection}>
          <h3>Staff</h3>
          {staff.map((member) => (
            <div key={member.id} style={styles.card}>
              <h4>{member.name}</h4>
              <p>Available Times: {Array.isArray(member.availableTimes) ? member.availableTimes.join(", ") : "N/A"}</p>
              <p>
                Services:{" "}
                {Array.isArray(member.serviceIds) && member.serviceIds.length > 0
                  ? member.serviceIds.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? service.name : "Unknown";
                    }).join(", ")
                  : "No Services Assigned"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  formContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
  },
  formSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  listsContainer: {
    display: "flex",
    gap: "20px",
  },
  listSection: {
    flex: 1,
  },
  card: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};

export default Dashboard;




  





// Working code backup

// import { useEffect, useState } from "react";
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
// import { db } from "../../firebaseConfig"; // Adjust the import to your Firebase config

// export default function Dashboard() {
//   const [services, setServices] = useState([]);
//   const [staff, setStaff] = useState([]);
//   const [newService, setNewService] = useState({
//     name: "",
//     description: "",
//     duration: "",
//     price: "",
//   });
//   const [newStaff, setNewStaff] = useState({
//     name: "",
//     serviceId: "",
//     availableTimes: "",
//   });
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Fetch services and staff data on page load
//     const fetchData = async () => {
//       try {
//         const servicesSnapshot = await getDocs(collection(db, "services"));
//         const staffSnapshot = await getDocs(collection(db, "providers"));

//         const servicesData = servicesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
//         const staffData = staffSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

//         setServices(servicesData);
//         setStaff(staffData);
//       } catch (err) {
//         setError("Failed to fetch data.");
//       }
//     };

//     fetchData();
//   }, []);

//   // Add new service
//   const handleAddService = async (e) => {
//     e.preventDefault();
//     try {
//       await addDoc(collection(db, "services"), newService);
//       setServices([...services, newService]);
//       setNewService({ name: "", description: "", duration: "", price: "" });
//     } catch (err) {
//       setError("Failed to add service.");
//     }
//   };

//   // Add new staff member
//   const handleAddStaff = async (e) => {
//     e.preventDefault();
//     try {
//       await addDoc(collection(db, "providers"), newStaff);
//       setStaff([...staff, newStaff]);
//       setNewStaff({ name: "", serviceId: "", availableTimes: "" });
//     } catch (err) {
//       setError("Failed to add staff member.");
//     }
//   };

//   // Delete a service
//   const handleDeleteService = async (id) => {
//     try {
//       await deleteDoc(doc(db, "services", id));
//       setServices(services.filter(service => service.id !== id));
//     } catch (err) {
//       setError("Failed to delete service.");
//     }
//   };

//   // Delete a staff member
//   const handleDeleteStaff = async (id) => {
//     try {
//       await deleteDoc(doc(db, "providers", id));
//       setStaff(staff.filter(member => member.id !== id));
//     } catch (err) {
//       setError("Failed to delete staff member.");
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Admin Dashboard</h2>
//       {error && <p style={styles.error}>{error}</p>}
//       <div style={styles.columns}>
//         <div style={styles.column}>
//           <h3>Manage Services</h3>
//           <form onSubmit={handleAddService} style={styles.form}>
//             <input
//               type="text"
//               placeholder="Service Name"
//               value={newService.name}
//               onChange={(e) => setNewService({ ...newService, name: e.target.value })}
//               required
//               style={styles.input}
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={newService.description}
//               onChange={(e) => setNewService({ ...newService, description: e.target.value })}
//               required
//               style={styles.input}
//             />
//             <input
//               type="number"
//               placeholder="Duration (in minutes)"
//               value={newService.duration}
//               onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
//               required
//               style={styles.input}
//             />
//             <input
//               type="number"
//               placeholder="Price"
//               value={newService.price}
//               onChange={(e) => setNewService({ ...newService, price: e.target.value })}
//               required
//               style={styles.input}
//             />
//             <button type="submit" style={styles.button}>Add Service</button>
//           </form>
//           <ul style={styles.list}>
//             {services.map((service) => (
//               <li key={service.id} style={styles.listItem}>
//                 <span>{service.name} - ${service.price}</span>
//                 <button onClick={() => handleDeleteService(service.id)} style={styles.deleteButton}>Delete</button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div style={styles.column}>
//           <h3>Manage Staff</h3>
//           <form onSubmit={handleAddStaff} style={styles.form}>
//             <input
//               type="text"
//               placeholder="Staff Name"
//               value={newStaff.name}
//               onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
//               required
//               style={styles.input}
//             />
//             <select
//               value={newStaff.serviceId}
//               onChange={(e) => setNewStaff({ ...newStaff, serviceId: e.target.value })}
//               required
//               style={styles.input}
//             >
//               <option value="">Select Service</option>
//               {services.map(service => (
//                 <option key={service.id} value={service.id}>
//                   {service.name}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="text"
//               placeholder="Available Times (comma separated)"
//               value={newStaff.availableTimes}
//               onChange={(e) => setNewStaff({ ...newStaff, availableTimes: e.target.value })}
//               required
//               style={styles.input}
//             />
//             <button type="submit" style={styles.button}>Add Staff</button>
//           </form>
//           <ul style={styles.list}>
//             {staff.map((member) => (
//               <li key={member.id} style={styles.listItem}>
//                 <span>{member.name} - Service: {services.find(s => s.id === member.serviceId)?.name}</span>
//                 <button onClick={() => handleDeleteStaff(member.id)} style={styles.deleteButton}>Delete</button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     padding: "20px",
//     fontFamily: "'Arial', sans-serif",
//   },
//   title: {
//     textAlign: "center",
//     marginBottom: "20px",
//     fontSize: "24px",
//     color: "#333",
//   },
//   columns: {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: "20px",
//   },
//   column: {
//     flex: 1,
//     padding: "20px",
//     backgroundColor: "#fff",
//     borderRadius: "8px",
//     boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column",
//     marginBottom: "20px",
//   },
//   input: {
//     padding: "10px",
//     marginBottom: "15px",
//     border: "1px solid #ccc",
//     borderRadius: "4px",
//     fontSize: "16px",
//   },
//   button: {
//     padding: "10px",
//     backgroundColor: "#007bff",
//     color: "white",
//     fontSize: "16px",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//   },
//   list: {
//     listStyleType: "none",
//     padding: "0",
//   },
//   listItem: {
//     padding: "10px",
//     marginBottom: "10px",
//     border: "1px solid #ccc",
//     borderRadius: "4px",
//     backgroundColor: "#f9f9f9",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   deleteButton: {
//     backgroundColor: "#e74c3c",
//     color: "white",
//     padding: "5px 10px",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//   },
//   error: {
//     marginTop: "10px",
//     color: "red",
//     fontSize: "14px",
//   },
// };
