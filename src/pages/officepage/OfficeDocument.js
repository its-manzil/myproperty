import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./officedocument.css";
import OfficeNav from "./OfficeNav";
import { BrowserProvider, Contract } from "ethers";
import RegistryABI from "./RegistryABI.json";



function OfficeDocument() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    landNumber: "",
    landmark: "",
    area: "",
    landType: "",
    ownerName: "",
    citizenshipNo: "",
  });
  const [contract, setContract] = useState(null);
  const contractAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; 


  // Redirect to login if no token is found
  useEffect(() => {
    const officeToken = localStorage.getItem("officeToken");
    if (!officeToken) {
      navigate("/OfficeLogin");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (window.ethereum) {
      const initEthers = async () => {
        const providerInstance = new BrowserProvider(window.ethereum);
        await providerInstance.send("eth_requestAccounts", []);
        
        const signer = await providerInstance.getSigner();
        const contractInstance = new Contract(contractAddress, RegistryABI, signer);
        setContract(contractInstance);
      };
      initEthers();
    } else {
      alert("Please install MetaMask to use this feature!");
    }
  }, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const officeToken = localStorage.getItem("officeToken");
    if (!officeToken) {
      
      navigate("/OfficeLogin");
      return;
    }

    // Decode office_id from token
    const payload = JSON.parse(atob(officeToken.split(".")[1]));
    const office_id = payload.office_id;

    const data = {
      land_number: form.landNumber,
      land_area: form.area,
      land_location: form.landmark,
      land_type: form.landType,
      owner_name: form.ownerName,
      citizenship_no: form.citizenshipNo,
      office_id,
    };

    try {
      const response = await fetch("http://localhost:8080/addProperty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${officeToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        
        setForm({
          landNumber: "",
          landmark: "",
          area: "",
          landType: "",
          ownerName: "",
          citizenshipNo: "",
        });
      } else {
        const error = await response.json();
        
      }
    } catch (error) {
      console.error("");
      
    }
    if (!contract) return alert("Contract is not loaded.");

    const { landNumber, landmark, area, landType, ownerName, citizenshipNo } = form;
    try {
      const tx = await contract.registerLand(landNumber, landmark, area, landType, ownerName, citizenshipNo);
      console.log("Transaction details:", tx);
      await tx.wait();
      
      
    } catch (error) {
      console.error("Transaction failed", error);
      
    }

  };

  return (
    <>
      <OfficeNav />
      <div>
        <div className="form-container">
          <h2>Add Property</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="landNumber"
                placeholder="Land Number"
                value={form.landNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="landmark"
                placeholder="Landmark"
                value={form.landmark}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="area"
                placeholder="Area (in sq. meters)"
                value={form.area}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="landType">Land Type:</label>
              <select
                id="landType"
                name="landType"
                value={form.landType}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Land Type
                </option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                name="ownerName"
                placeholder="Land Owner Name"
                value={form.ownerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="citizenshipNo"
                placeholder="Citizenship Number"
                value={form.citizenshipNo}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default OfficeDocument;
