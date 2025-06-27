import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const fontMeta = {
  "Open Sans": {
    url: "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
    family: "'Open Sans', sans-serif"
  },
  "Dancing Script": {
    url: "https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap",
    family: "'Dancing Script', cursive"
  },
  "Roboto": {
    url: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
    family: "'Roboto', sans-serif"
  },
  "Lora": {
    url: "https://fonts.googleapis.com/css2?family=Lora&display=swap",
    family: "'Lora', serif"
  },
  "Merriweather": {
    url: "https://fonts.googleapis.com/css2?family=Merriweather&display=swap",
    family: "'Merriweather', serif"
  },
  "Playfair Display": {
    url: "https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap",
    family: "'Playfair Display', serif"
  },
  "Poppins": {
    url: "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    family: "'Poppins', sans-serif"
  }
};


const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    staff: [],
    categoryId: ""
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    availableTimes: [],
    serviceIds: []
  });
  const [availableTimesInput, setAvailableTimesInput] = useState("");
  const [activeSection, setActiveSection] = useState("addService");
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [headingFont, setHeadingFont] = useState("Open Sans");
  const [bodyFont, setBodyFont] = useState("Open Sans");

  // State for responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchAllData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchServices(), fetchStaff(), fetchCategories()]);
  };

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "servicesCategory"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(list);
  };

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name cannot be empty");
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase().trim())) {
      alert("Category already exists");
      return;
    }
    await addDoc(collection(db, "servicesCategory"), { name: newCategoryName.trim() });
    setNewCategoryName("");
    fetchCategories();
  };

  const handleAddService = async () => {
    if (!newService.name.trim() || !newService.categoryId) {
      alert("Please enter service name and select a category");
      return;
    }
    const newDoc = await addDoc(collection(db, "services"), newService);
    for (const staffId of newService.staff) {
      const refDoc = doc(db, "providers", staffId);
      const member = staff.find(s => s.id === staffId);
      if (member) {
        const updatedServiceIds = member.serviceIds ? [...member.serviceIds, newDoc.id] : [newDoc.id];
        await updateDoc(refDoc, { serviceIds: updatedServiceIds });
      }
    }
    setNewService({ name: "", description: "", duration: "", price: "", staff: [], categoryId: "" });
    fetchServices();
    fetchStaff();
  };

  const handleAddStaff = async () => {
    if (!newStaff.name.trim()) {
      alert("Please enter staff name");
      return;
    }

    const times = availableTimesInput.split(",").map(t => t.trim()).filter(t => t);

    const newDoc = await addDoc(collection(db, "providers"), {
      name: newStaff.name,
      availableTimes: times,
      serviceIds: newStaff.serviceIds
    });

    for (const serviceId of newStaff.serviceIds) {
      const refDoc = doc(db, "services", serviceId);
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const updatedStaff = service.staff ? [...service.staff, newDoc.id] : [newDoc.id];
        await updateDoc(refDoc, { staff: updatedStaff });
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
  if (!logoFile) {
    alert("Please select a logo file first.");
    return;
  }

  const formData = new FormData();
  formData.append("image", logoFile);

  try {
    const response = await fetch("http://localhost:8080/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const imageUrl = data.url; // e.g., /images/filename.png

    await setDoc(doc(db, "businessSettings", "branding"), {
      logoUrl: imageUrl,
    }, { merge: true });

    alert("Logo uploaded successfully!");
    setLogoFile(null);
  } catch (error) {
    alert("Error uploading logo: " + error.message);
  }
};


const handleBgUpload = async () => {
  if (!bgFile) {
    alert("Please select a background image file first.");
    return;
  }

  const formData = new FormData();
  formData.append("image", bgFile);

  try {
    const response = await fetch("http://localhost:8080/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const imageUrl = data.url;

    await setDoc(doc(db, "businessSettings", "branding"), {
      bgImageUrl: imageUrl,
    }, { merge: true });

    alert("Background image uploaded successfully!");
    setBgFile(null);
  } catch (error) {
    alert("Error uploading background image: " + error.message);
  }
};


  const handleSaveFonts = async () => {
  try {
    await setDoc(doc(db, "businessSettings", "branding"), {
      headingFont: fontMeta[headingFont].url,
      headingFontFamily: fontMeta[headingFont].family,
      bodyFont: fontMeta[bodyFont].url,
      bodyFontFamily: fontMeta[bodyFont].family
    }, { merge: true });
    alert("Fonts updated successfully!");
  } catch (error) {
    alert("Failed to update fonts: " + error.message);
  }
};


  // Responsive overrides
  const responsiveStyles = {
    wrapper: {
      flexDirection: "column",
    },
    sidebar: {
      width: "unset",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      padding: 10,
    },
    main: {
      padding: 20,
      width: "unset",
    },
    formBox: {
      width: "100%",
      padding: 15,
    },
    input: {
      width: "100%",
    },
    textarea: {
      width: "100%",
    },
    row: {
      flexDirection: "column",
    },
    column: {
      width: "100%",
      marginBottom: 20,
    },
    navButton: {
      flex: "1 0 45%",
      marginBottom: 10,
      fontSize: 14,
      padding: 8,
    }
  };

  // Helper to merge styles (normal + responsive)
  const getStyle = (styleName) => {
    if (isMobile) {
      return { ...styles[styleName], ...responsiveStyles[styleName] };
    }
    return styles[styleName];
  };

  return (
    <div style={getStyle("wrapper")}>
      <aside style={getStyle("sidebar")}>
        <h2 style={styles.sidebarTitle}>Dashboard</h2>
        <button style={getStyle("navButton")} onClick={() => setActiveSection("addService")}>Add Service</button>
        <button style={getStyle("navButton")} onClick={() => setActiveSection("addStaff")}>Add Staff</button>
        <button style={getStyle("navButton")} onClick={() => setActiveSection("uploadLogo")}>Upload Logo</button>
        <button style={getStyle("navButton")} onClick={() => setActiveSection("uploadBackground")}>Upload Background</button>
        <button style={getStyle("navButton")} onClick={() => setActiveSection("manageCategories")}>Manage Categories</button>
        <button style={getStyle("navButton")} onClick={() => setActiveSection("changeFonts")}>Change Fonts</button>

      </aside>

      <main style={getStyle("main")}>
        <h2 style={styles.heading}>Admin Dashboard</h2>

        {activeSection === "addService" && (
          <div style={getStyle("formBox")}>
            <h3>Add New Service</h3>
            <input placeholder="Service Name" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} style={getStyle("input")} />
            <input placeholder="Description" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} style={getStyle("input")} />
            <input placeholder="Duration (mins)" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} style={getStyle("input")} />
            <input placeholder="Price (€)" type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} style={getStyle("input")} />
            <select value={newService.categoryId} onChange={(e) => setNewService({ ...newService, categoryId: e.target.value })} style={getStyle("input")}>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <div style={styles.checkboxGroup}>
              <p>Assign Staff:</p>
              {staff.map(member => (
                <label key={member.id} style={styles.checkboxLabel}>
                  <input type="checkbox" checked={newService.staff.includes(member.id)} onChange={() => handleStaffCheckbox(member.id)} />
                  {member.name}
                </label>
              ))}
            </div>
            <button style={getStyle("button")} onClick={handleAddService}>Add Service</button>
          </div>
        )}

        {activeSection === "addStaff" && (
          <div style={getStyle("formBox")}>
            <h3>Add New Staff</h3>
            <input placeholder="Staff Name" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} style={getStyle("input")} />
            <textarea placeholder="Available Times (comma separated)" value={availableTimesInput} onChange={(e) => setAvailableTimesInput(e.target.value)} style={getStyle("textarea")} />
            <div style={styles.checkboxGroup}>
              <p>Assign Services:</p>
              {services.map(service => (
                <label key={service.id} style={styles.checkboxLabel}>
                  <input type="checkbox" checked={newStaff.serviceIds.includes(service.id)} onChange={() => handleServiceCheckbox(service.id)} />
                  {service.name}
                </label>
              ))}
            </div>
            <button style={getStyle("button")} onClick={handleAddStaff}>Add Staff</button>
          </div>
        )}

        {activeSection === "uploadLogo" && (
          <div style={getStyle("formBox")}>
            <h3>Upload Logo</h3>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
            <button style={getStyle("button")} onClick={handleLogoUpload}>Upload Logo</button>
          </div>
        )}

        {activeSection === "uploadBackground" && (
          <div style={getStyle("formBox")}>
            <h3>Upload Background Image</h3>
            <input type="file" accept="image/*" onChange={(e) => setBgFile(e.target.files[0])} />
            <button style={getStyle("button")} onClick={handleBgUpload}>Upload Background</button>
          </div>
        )}

        {activeSection === "manageCategories" && (
          <div style={getStyle("formBox")}>
            <h3>Manage Categories</h3>
            <input placeholder="New Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={getStyle("input")} />
            <button style={getStyle("button")} onClick={handleAddCategory}>Add Category</button>
            <div style={styles.cardList}>
              {categories.map(cat => (
                <div key={cat.id} style={styles.card}>
                  {cat.name}
                </div>
              ))}
            </div>
          </div>
        )}

         {activeSection === "changeFonts" && (
          <div style={styles.formBox}>
            <h3>Change Fonts</h3>
            <label>Heading Font:</label>
            <select
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value)}
              style={styles.input}
            >
              {Object.keys(fontMeta).map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <label>Body Font:</label>
            <select
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value)}
              style={styles.input}
            >
              {Object.keys(fontMeta).map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <button style={styles.button} onClick={handleSaveFonts}>
              Save Font Settings
            </button>
          </div>
        )}


        <div style={getStyle("row")}>
          <div style={getStyle("column")}>
            <h3>Staff</h3>
            {staff.map((s) => (
              <div key={s.id} style={styles.card}>
                <strong>{s.name}</strong><br />
                Services: {services.filter((srv) => s.serviceIds.includes(srv.id)).map((srv) => srv.name).join(", ")}<br />
                Times: {s.availableTimes.join(", ")}
              </div>
            ))}
          </div>

          <div style={getStyle("column")}>
            <h3>Categories</h3>
            {categories.map((cat) => (
              <div key={cat.id} style={styles.card}>
                {cat.name}
              </div>
            ))}
          </div>

          <div style={getStyle("column")}>
            <h3>Services</h3>
            {services.map((srv) => (
              <div key={srv.id} style={styles.card}>
                <strong>{srv.name}</strong><br />
                Category: {categories.find((cat) => cat.id === srv.categoryId)?.name || "Uncategorized"}
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
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f6f8",
  },
  sidebar: {
    backgroundColor: "#007bff",
    padding: "20px",
    width: "unset",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  sidebarTitle: {
    fontSize: "20px",
    marginBottom: "15px"
  },
  navButton: {
    backgroundColor: "#0056b3",
    border: "none",
    color: "#fff",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "bold"
  },
  main: {
    flexGrow: 1,
    padding: "30px",
    width: "unset"
  },

  heading: {
    fontSize: "28px",
    marginBottom: "25px"
  },
  formBox: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    marginBottom: "30px",
    width: "30%",
    boxSizing: "border-box"  
  },
  input: {
    display: "block",
    width: "75%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box"  
  },
  textarea: {
    display: "block",
    width: "75%",
    height: "80px",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  button: {
    padding: "12px 18px",
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  checkboxGroup: {
    marginBottom: "15px"
  },
  checkboxLabel: {
    display: "block",
    marginBottom: "6px"
  },
  row: {
    display: "flex",
    gap: "20px"
  },
  column: {
    flex: 1
  },
  cardList: {
    marginTop: "10px"
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    boxSizing: "border-box"
  },
  
};

export default Dashboard;
