import React, { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default class DeletePackages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            package: null,
            loading: true,
            redirect: false,
            errorMessage: "",
            confirmDelete: false
        };
    }

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
                this.setState({
                    package: response.data,
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

    handleDelete = async () => {
        if (!this.state.confirmDelete) {
            this.setState({ confirmDelete: true });
            return;
        }

        try {
            const packageId = this.getPackageIdFromUrl();
            
            const response = await axios.delete(`http://localhost:8000/api/packages/${packageId}`);
            
            if (response.status === 200) {
                alert("Package Deleted Successfully!");
                this.setState({ redirect: true });
            }
        } catch (error) {
            console.error("Error deleting package:", error);
            this.setState({ 
                errorMessage: error.response?.data?.message || "Error deleting package.",
                confirmDelete: false
            });
        }
    };

    handleCancel = () => {
        this.setState({ redirect: true });
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

        if (this.state.errorMessage && !this.state.package) {
            return (
                <div className="content" style={{ padding: "20px", textAlign: "center" }}>
                    <div className="alert alert-danger" role="alert">
                        {this.state.errorMessage}
                    </div>
                    <button 
                        className="btn btn-secondary"
                        onClick={this.handleCancel}
                    >
                        Back to Package Management
                    </button>
                </div>
            );
        }

        const pkg = this.state.package;
        
        return (
            <div className="content" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
                <h1 className="h3 mb-3 font-weight-normal text-danger">
                    🗑️ Delete Package
                </h1>
                
                {!this.state.confirmDelete ? (
                    <div>
                        <div className="alert alert-warning" role="alert">
                            <strong>⚠️ Warning:</strong> You are about to delete this package. This action cannot be undone.
                        </div>

                        {/* Package Details */}
                        <div style={{ 
                            padding: "20px", 
                            backgroundColor: "#f8f9fa", 
                            borderRadius: "5px",
                            border: "1px solid #e9ecef",
                            marginBottom: "20px"
                        }}>
                            <h4>📦 Package to Delete:</h4>
                            <h5 className="text-danger">{pkg.name}</h5>
                            <p><strong>Description:</strong> {pkg.description || 'No description'}</p>
                            <p><strong>Category:</strong> {pkg.category}</p>
                            <p><strong>Price:</strong> Rs {pkg.pricePerChild} per child</p>
                            
                            {pkg.features && pkg.features.length > 0 && (
                                <div>
                                    <strong>Features:</strong>
                                    <ul>
                                        {pkg.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <p><strong>Created:</strong> {new Date(pkg.createdAt).toLocaleDateString()}</p>
                            <p><strong>Last Updated:</strong> {new Date(pkg.updatedAt).toLocaleDateString()}</p>
                        </div>

                        <div className="text-center">
                            <button 
                                className="btn btn-danger btn-lg"
                                onClick={this.handleDelete}
                                style={{ marginRight: "15px" }}
                            >
                                🗑️ Delete This Package
                            </button>
                            
                            <button 
                                className="btn btn-secondary btn-lg"
                                onClick={this.handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="alert alert-danger" role="alert">
                            <h4 className="alert-heading">🚨 Final Confirmation</h4>
                            <p>Are you absolutely sure you want to delete <strong>"{pkg.name}"</strong>?</p>
                            <hr />
                            <p className="mb-0">This action is <strong>PERMANENT</strong> and cannot be undone!</p>
                        </div>

                        {this.state.errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {this.state.errorMessage}
                            </div>
                        )}

                        <div className="text-center">
                            <button 
                                className="btn btn-danger btn-lg"
                                onClick={this.handleDelete}
                                style={{ marginRight: "15px" }}
                            >
                                ✅ Yes, Delete Forever
                            </button>
                            
                            <button 
                                className="btn btn-success btn-lg"
                                onClick={() => this.setState({ confirmDelete: false })}
                            >
                                ❌ No, Keep Package
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}