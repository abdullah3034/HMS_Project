import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PackageHome.css'; // Assuming you have a CSS file for styling


const PackageHome = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerChild: '',
    category: 'general',
    features: ['']
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/packages');
      setPackages(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching packages:', error);
      setErrorMessage('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricePerChild: '',
      category: 'general',
      features: ['']
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setSelectedPackage(null);
    setShowModal(true);
  };

  const openEditModal = (pkg) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      pricePerChild: pkg.pricePerChild.toString(),
      category: pkg.category,
      features: pkg.features && pkg.features.length > 0 ? pkg.features : ['']
    });
    setModalMode('edit');
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPackage(null);
    resetForm();
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        features: newFeatures
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage('');

    try {
      const submitData = {
        ...formData,
        pricePerChild: parseFloat(formData.pricePerChild),
        features: formData.features.filter(feature => feature.trim() !== '')
      };

      if (modalMode === 'add') {
        await axios.post('http://localhost:8000/api/packages', submitData);
      } else {
        await axios.put(`http://localhost:8000/api/packages/${selectedPackage._id}`, submitData);
      }

      await fetchPackages();
      closeModal();
    } catch (error) {
      console.error('Error saving package:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save package. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/packages/${packageToDelete._id}`);
      await fetchPackages();
      setShowDeleteModal(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error('Error deleting package:', error);
      setErrorMessage('Failed to delete package. Please try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const getFilteredPackages = () => {
    return packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || pkg.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredPackages = getFilteredPackages();

  if (loading) {
    return (
      <div className="pkg-home-enhanced">
        <div className="pkg-loading-container">
          <div className="pkg-loading-spinner"></div>
          <h3>Loading packages...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="pkg-home-enhanced">
      <div className="pkg-container">
        <div className="pkg-header-section">
          <h2 className="pkg-page-title"> Package Management</h2>
          
          <div className="pkg-action-buttons">
            <button className="pkg-btn pkg-btn-primary" onClick={openAddModal}>
               Add New Package
            </button>
            <button className="pkg-btn pkg-btn-secondary" onClick={fetchPackages}>
               Refresh
            </button>
          </div>
        </div>

        <div className="pkg-filters-section">
          <div className="pkg-search-container">
            <input
              type="text"
              className="pkg-search-input"
              placeholder=" Search packages..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="pkg-filter-container">
            <select
              className="pkg-filter-select"
              value={filterCategory}
              onChange={handleFilterChange}
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="family">Family</option>
              <option value="kids">Kids Only</option>
              <option value="adults">Adults Only</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="pkg-error-alert">
            <span className="pkg-error-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        <div className="pkg-packages-grid">
          {filteredPackages.length === 0 ? (
            <div className="pkg-no-packages">
              <div className="pkg-no-packages-content">
                <div className="pkg-no-packages-icon">📦</div>
                <h4>No packages found</h4>
                <p>Try adjusting your search criteria or add a new package.</p>
                <button className="pkg-btn pkg-btn-primary" onClick={openAddModal}>
                  Add Your First Package
                </button>
              </div>
            </div>
          ) : (
            filteredPackages.map(pkg => (
              <div key={pkg._id} className="pkg-package-card">
                <div className="pkg-card-header">
                  <h5 className="pkg-package-name">{pkg.name}</h5>
                  <span className={`pkg-category-badge pkg-category-${pkg.category}`}>
                    {pkg.category}
                  </span>
                </div>
                
                <div className="pkg-card-body">
                  <p className="pkg-package-description">{pkg.description}</p>
                  
                  <div className="pkg-package-price">
                    <span className="pkg-price-label">Price:</span>
                    <span className="pkg-price-value">Rs {pkg.pricePerChild}</span>
                    <span className="pkg-price-unit">per child</span>
                  </div>

                  {pkg.features && pkg.features.length > 0 && (
                    <div className="pkg-features-section">
                      <strong className="pkg-features-title">Features:</strong>
                      <ul className="pkg-features-list">
                        {pkg.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="pkg-feature-item">
                            • {feature}
                          </li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="pkg-feature-item pkg-more-features">
                            ... and {pkg.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pkg-card-footer">
                  <div className="pkg-action-buttons-group">
                    <button 
                      className="pkg-btn pkg-btn-edit"
                      onClick={() => openEditModal(pkg)}
                    >
                       Edit
                    </button>
                    <button 
                      className="pkg-btn pkg-btn-delete"
                      onClick={() => handleDeleteClick(pkg)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="pkg-modal-overlay">
          <div className="pkg-modal-content">
            <div className="pkg-modal-header">
              <h3>{modalMode === 'add' ? '✨ Add New Package' : '✏️ Edit Package'}</h3>
              <button className="pkg-modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="pkg-modal-form">
              <div className="pkg-form-group">
                <label htmlFor="name" className="pkg-form-label">Package Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pkg-form-input"
                  required
                  placeholder="Enter package name"
                />
              </div>

              <div className="pkg-form-group">
                <label htmlFor="description" className="pkg-form-label">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="pkg-form-textarea"
                  required
                  placeholder="Enter package description"
                  rows="3"
                />
              </div>

              <div className="pkg-form-row">
                <div className="pkg-form-group">
                  <label htmlFor="pricePerChild" className="pkg-form-label">Price  (Rs) *</label>
                  <input
                    type="number"
                    id="pricePerChild"
                    name="pricePerChild"
                    value={formData.pricePerChild}
                    onChange={handleInputChange}
                    className="pkg-form-input"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="pkg-form-group">
                  <label htmlFor="category" className="pkg-form-label">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="pkg-form-select"
                    required
                  >
                    <option value="general">General</option>
                    <option value="family">Family</option>
                    <option value="kids">Kids Only</option>
                    <option value="adults">Adults Only</option>
                  </select>
                </div>
              </div>

              <div className="pkg-form-group">
                <label className="pkg-form-label">Features</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="pkg-feature-input-group">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="pkg-form-input"
                      placeholder={`Feature ${index + 1}`}
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="pkg-btn pkg-btn-remove-feature"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="pkg-btn pkg-btn-add-feature"
                >
                  + Add Feature
                </button>
              </div>

              <div className="pkg-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="pkg-btn pkg-btn-cancel"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pkg-btn pkg-btn-submit"
                  disabled={submitLoading}
                >
                  {submitLoading ? '💫 Saving...' : (modalMode === 'add' ? '✨ Add Package' : '💾 Update Package')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="pkg-modal-overlay">
          <div className="pkg-modal-content pkg-delete-modal">
            <div className="pkg-modal-header">
              <h3>🗑️ Delete Package</h3>
              <button className="pkg-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            
            <div className="pkg-delete-modal-body">
              <p>Are you sure you want to delete the package <strong>"{packageToDelete?.name}"</strong>?</p>
              <p className="pkg-delete-warning">This action cannot be undone.</p>
            </div>

            <div className="pkg-modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="pkg-btn pkg-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="pkg-btn pkg-btn-delete-confirm"
              >
                🗑️ Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageHome;