import React, { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default class EditPackages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PackageName: "",
            PackageType: "",
            packgeprice: "",
            packageincludes: "",
            description: "",
            redirect: false,
            errorMessage: "",
            loading: true
        };
    }

    // Get package ID from URL
    componentDidMount() {
        const packageId = this.getPackageIdFromUrl();
        if (packageId) {
            this.fetchPackageDetails(packageId);
        } else {
            this.setState({ 
                errorMessage: "Package ID not found in URL",
                loading: false 
            });
        }
    }

    getPackageIdFromUrl = () => {
        // Extract package ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || window.location.pathname.split('/').pop();
    };

    fetchPackageDetails = async (packageId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/packages/${packageId}`);
            
            if (response.data) {
                const pkg = response.data;
                this.setState({
                    PackageName: pkg.name || "",
                    PackageType: pkg.category || "",
                    packgeprice: pkg.pricePerChild || "",
                    packageincludes: pkg.features ? pkg.features.join(', ') : "",
                    description: pkg.description || "",
                    loading: false
                });
            }
        } catch (error) {
            console.error("Error fetching package:", error);
            this.setState({ 
                errorMessage: error.response?.data?.message || "Failed to fetch package details.",
                loading: false 
            });
        }
    };

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
            const packageId = this.getPackageIdFromUrl();
            
            // Prepare data to match the backend API format
            const packageData = {
                name: this.state.PackageName,
                description: this.state.description,
                pricePerChild: parseFloat(this.state.packgeprice),
                category: this.state.PackageType,
                features: this.state.packageincludes ? this.state.packageincludes.split(',').map(f => f.trim()) : []
            };

            const response = await axios.put(`http://localhost:8000/api/packages/${packageId}`, packageData);
            
            if (response.status === 200) {
                alert("Package Updated Successfully!");
                this.setState({ redirect: true });
            }
        } catch (error) {
            console.error("Error updating package:", error);
            this.setState({ 
                errorMessage: error.response?.data?.message || "Error updating package." 
            });
        }
    };

    render() {
        if (this.state.redirect) {
            return <Navigate to="/packages" />;
        }

        if (this.state.loading) {
            return (
                <div className="content" style={{ padding: "20px", textAlign: "center" }}>
                    <h3>Loading package details...</h3>
                </div>
            );
        }
        
        return (
            <div className="content" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
                <h1 className="h3 mb-3 font-weight-normal">Edit Package</h1>
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
                        Update Package
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
                        backgroundColor: "#e3f2fd", 
                        borderRadius: "5px",
                        border: "1px solid #2196f3"
                    }}>
                        <h4>📦 Package Preview:</h4>
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
                                        .filter(feature => feature.trim() !== '')
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