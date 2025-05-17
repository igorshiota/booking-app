import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newService, setNewService] = useState({ name: "", description: "", duration: "", price: "", staff: [] });
  const [newStaff, setNewStaff] = useState({ name: "", availableTimes: [], serviceIds: [] });
  const [availableTimesInput, setAvailableTimesInput] = useState("");
  const [activeSection, setActiveSection] = useState("addService");
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchStaff();
  }, []);

  const fetchServices = async () => {
    const snapshot = await getDocs(collection(db, "services"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setServices(list);
  };

  const fetchStaff = async () => {
    const snapshot = await getDocs(collection(db, "providers"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStaff(list);
  };

  const handleAddService = async () => {
    const newDoc = await addDoc(collection(db, "services"), newService);
    for (const staffId of newService.staff) {
      const refDoc = doc(db, "providers", staffId);
      const member = staff.find(s => s.id === staffId);
      if (member) {
        const updated = member.serviceIds ? [...member.serviceIds, newDoc.id] : [newDoc.id];
        await updateDoc(refDoc, { serviceIds: updated });
      }
    }
    setNewService({ name: "", description: "", duration: "", price: "", staff: [] });
    fetchServices();
    fetchStaff();
  };

  const handleAddStaff = async () => {
    const times = availableTimesInput.split(",").map(t => t.trim());
    const newDoc = await addDoc(collection(db, "providers"), {
      name: newStaff.name,
      availableTimes: times,
      serviceIds: newStaff.serviceIds
    });
    for (const serviceId of newStaff.serviceIds) {
      const refDoc = doc(db, "services", serviceId);
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const updated = service.staff ? [...service.staff, newDoc.id] : [newDoc.id];
        await updateDoc(refDoc, { staff: updated });
      }
    }
    setNewStaff({ name: "", availableTimes: [], serviceIds: [] });
    setAvailableTimesInput("");
    fetchServices();
    fetchStaff();
  };

  const handleStaffCheckbox = (id) => {
    setNewService(prev => ({
      ...prev,
      staff: prev.staff.includes(id) ? prev.staff.filter(s => s !== id) : [...prev.staff, id]
    }));
  };

  const handleServiceCheckbox = (id) => {
    setNewStaff(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id) ? prev.serviceIds.filter(s => s !== id) : [...prev.serviceIds, id]
    }));
  };

  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };


const handleLogoUpload = async () => {
    if (!logoFile) return alert("Please select a logo file first.");
    try {
      const url = await uploadImage(logoFile, "businessSettings/logo.png");
      await setDoc(doc(db, "businessSettings", "branding"), { logoUrl: url }, { merge: true });
      alert("Logo uploaded successfully!");
      setLogoFile(null);
    } catch (error) {
      alert("Error uploading logo: " + error.message);
    }
  };
  
  const handleBgUpload = async () => {
    if (!bgFile) return alert("Please select a background image file first.");
    try {
      const url = await uploadImage(bgFile, "businessSettings/background.png");
      await setDoc(doc(db, "businessSettings", "branding"), { bgImageUrl: url }, { merge: true });
      alert("Background image uploaded successfully!");
      setBgFile(null);
    } catch (error) {
      alert("Error uploading background image: " + error.message);
    }
  };
  

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Dashboard</h2>
        <button style={styles.navButton} onClick={() => setActiveSection("addService")}>Add Service</button>
        <button style={styles.navButton} onClick={() => setActiveSection("addStaff")}>Add Staff</button>
        <button style={styles.navButton} onClick={() => setActiveSection("uploadLogo")}>Upload Logo</button>
        <button style={styles.navButton} onClick={() => setActiveSection("uploadBackground")}>Upload Background</button>
      </aside>

      <main style={styles.main}>
        <h2 style={styles.heading}>Admin Dashboard</h2>

        <div style={styles.forms}>
          {activeSection === "addService" && (
            <div style={styles.formBox}>
              <h3>Add New Service</h3>
              <input placeholder="Service Name" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} style={styles.input} />
              <input placeholder="Description" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} style={styles.input} />
              <input placeholder="Duration (mins)" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} style={styles.input} />
              <input placeholder="Price (€)" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} style={styles.input} />
              <div style={styles.checkboxGroup}>
                <p>Assign Staff:</p>
                {staff.map(member => (
                  <label key={member.id} style={styles.checkboxLabel}>
                    <input type="checkbox" checked={newService.staff.includes(member.id)} onChange={() => handleStaffCheckbox(member.id)} />
                    {member.name}
                  </label>
                ))}
              </div>
              <button style={styles.button} onClick={handleAddService}>Add Service</button>
            </div>
          )}

          {activeSection === "addStaff" && (
            <div style={styles.formBox}>
              <h3>Add New Staff</h3>
              <input placeholder="Staff Name" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} style={styles.input} />
              <input placeholder="Available Times (comma separated)" value={availableTimesInput} onChange={(e) => setAvailableTimesInput(e.target.value)} style={styles.input} />
              <div style={styles.checkboxGroup}>
                <p>Assign Services:</p>
                {services.map(service => (
                  <label key={service.id} style={styles.checkboxLabel}>
                    <input type="checkbox" checked={newStaff.serviceIds.includes(service.id)} onChange={() => handleServiceCheckbox(service.id)} />
                    {service.name}
                  </label>
                ))}
              </div>
              <button style={styles.button} onClick={handleAddStaff}>Add Staff</button>
            </div>
          )}

          {activeSection === "uploadLogo" && (
            <div style={styles.formBox}>
              <h3>Upload Logo</h3>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} style={styles.input} />
              <button style={styles.button} onClick={handleLogoUpload}>Upload Logo</button>
            </div>
          )}

          {activeSection === "uploadBackground" && (
            <div style={styles.formBox}>
              <h3>Upload Background Image</h3>
              <input type="file" accept="image/*" onChange={(e) => setBgFile(e.target.files[0])} style={styles.input} />
              <button style={styles.button} onClick={handleBgUpload}>Upload Background</button>
            </div>
          )}
        </div>

        <div style={styles.lists}>
          <div style={styles.list}>
            <h3>Services</h3>
            {services.map(service => (
              <div key={service.id} style={styles.card}>
                <strong>{service.name}</strong>
                <p>{service.description}</p>
                <p>Duration: {service.duration} mins</p>
                <p>Price: €{service.price}</p>
                <p>Staff: {service.staff?.map(id => staff.find(s => s.id === id)?.name || "Unknown").join(", ") || "None"}</p>
              </div>
            ))}
          </div>
          <div style={styles.list}>
            <h3>Staff</h3>
            {staff.map(member => (
              <div key={member.id} style={styles.card}>
                <strong>{member.name}</strong>
                <p>Available: {member.availableTimes?.join(", ") || "N/A"}</p>
                <p>Services: {member.serviceIds?.map(id => services.find(s => s.id === id)?.name || "Unknown").join(", ") || "None"}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#2c3e50",
    color: "#fff",
    padding: "20px",
  },
  sidebarTitle: {
    fontSize: "20px",
    marginBottom: "20px",
  },
  navButton: {
    display: "block",
    background: "transparent",
    border: "none",
    color: "#ecf0f1",
    padding: "10px 0",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    fontSize: "16px",
  },
  main: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#f9f9f9",
  },
  heading: {
    marginBottom: "30px",
  },
  forms: {
    marginBottom: "40px",
  },
  formBox: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    maxWidth: "500px",
  },
  input: {
    width: "50%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  checkboxGroup: {
    marginBottom: "15px",
  },
  checkboxLabel: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "12px 20px",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "16px",
  },
  lists: {
    display: "flex",
    gap: "40px",
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "6px",
    boxShadow: "0 0 6px rgba(0,0,0,0.05)",
  }
};

export default Dashboard;
