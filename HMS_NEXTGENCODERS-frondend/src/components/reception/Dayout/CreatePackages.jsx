import React, { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import './Createpackeages.css'; // Import your CSS for styling

export default class CreatePackages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PackageName: "",
            PackageType: "",
            packgeprice: "",
            packageincludes: "",
            description: "",
            redirect: false,
            errorMessage: ""
        };
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = async (e) => {
        e.preventDefault();

        if (!this.state.PackageName) {
            this.setState({ errorMessage: "Package Name cannot be empty!" });
            return;
        }

        if (!this.state.packgeprice || this.state.packgeprice <= 0) {
            this.setState({ errorMessage: "Package price must be greater than 0!" });
            return;
        }

        try {
            // Prepare data to match the backend API format
            const packageData = {
                name: this.state.PackageName,
                description: this.state.description,
                pricePerChild: parseFloat(this.state.packgeprice),
                category: this.state.PackageType,
                features: this.state.packageincludes ? this.state.packageincludes.split(',').map(f => f.trim()) : []
            };

            const response = await axios.post("http://localhost:8000/api/packages", packageData);
            
            if (response.status === 201) {
                alert("Package Added Successfully!");
                this.setState({ redirect: true });
            }
        } catch (error) {
            console.error("Error creating package:", error);
            this.setState({ 
                errorMessage: error.response?.data?.message || "Error saving package." 
            });
        }
    };

    render() {
        if (this.state.redirect) {
            return <Navigate to="/packages" />;
        }
        
        return (
            <div className="content" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
                <h1 className="h3 mb-3 font-weight-normal">Add a New Package</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Package Name</label>&nbsp;&nbsp;
                        <input
                            type="text"
                            className="form-control"
                            name="PackageName"
                            placeholder="e.g., Family Bonding Package"
                            value={this.state.PackageName}
                            onChange={this.handleInputChange}
                            required
                        />
                    </div>
                    <br />
                    
                    <div className="form-group">
                        <label>Description</label>&nbsp;&nbsp;
                        <textarea
                            className="form-control"
                            name="description"
                            placeholder="Describe what this package includes..."
                            value={this.state.description}
                            onChange={this.handleInputChange}
                            rows="3"
                        />
                    </div>
                    <br />
                    
                    <div className="form-group">
                        <label>Package Type</label>&nbsp;&nbsp;
                        <select
                            name="PackageType"
                            className="form-control"
                            value={this.state.PackageType}
                            onChange={this.handleInputChange}
                            required
                        >
                            <option value="" disabled hidden>Select Package Type</option>
                            <option value="general">General</option>
                            <option value="family">Family</option>
                            <option value="kids">Kids Only</option>
                            <option value="adults">Adults Only</option>
                        </select>
                    </div>
                    <br />
                    
                    <div className="form-group">
                        <label>Package Price (Rs per child)</label>&nbsp;&nbsp;
                        <input
                            type="number"
                            className="form-control"
                            name="packgeprice"
                            placeholder="e.g., 8820"
                            value={this.state.packgeprice}
                            onChange={this.handleInputChange}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <br />
                    
                    <div className="form-group">
                        <label>Package Includes (Features)</label>&nbsp;&nbsp;
                        <textarea
                            className="form-control"
                            name="packageincludes"
                            placeholder="Enter features separated by commas. e.g., Swimming pool access, Family games, Lunch included"
                            value={this.state.packageincludes}
                            onChange={this.handleInputChange}
                            rows="3"
                        />
                        <small className="form-text text-muted">
                            Separate multiple features with commas
                        </small>
                    </div>
                    <br />
                    
                    {this.state.errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {this.state.errorMessage}
                        </div>
                    )}
                    
                    <button className="btn btn-success" type="submit">
                        Save Package
                    </button>
                    
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ marginLeft: "10px" }}
                        onClick={() => this.setState({ redirect: true })}
                    >
                        Cancel
                    </button>
                </form>

                {/* Preview Section */}
                {this.state.PackageName && (
                    <div style={{ 
                        marginTop: "30px", 
                        padding: "20px", 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "5px",
                        border: "1px solid #e9ecef"
                    }}>
                        <h4>Package Preview:</h4>
                        <h5>{this.state.PackageName}</h5>
                        <p>{this.state.description}</p>
                        <p><strong>Type:</strong> {this.state.PackageType}</p>
                        <p><strong>Price:</strong> Rs {this.state.packgeprice} per child</p>
                        {this.state.packageincludes && (
                            <div>
                                <strong>Features:</strong>
                                <ul>
                                    {this.state.packageincludes
                                        .split(',')
                                        .map((feature, index) => (
                                            <li key={index}>{feature.trim()}</li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}