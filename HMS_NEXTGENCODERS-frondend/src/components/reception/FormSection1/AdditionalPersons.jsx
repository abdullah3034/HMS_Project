import React from 'react';
//an array of person objects.
//function to add a new person.
//function to remove a person.
 //function to update person info
const AdditionalPersons = ({ persons, handleAddPerson, handleRemovePerson, handlePersonChange }) => {
  return (
    <div className="checkinform-form-container">
      <h2 className="checkinform-form-heading">Information of Other Person</h2>
      <div className="person-table-responsive">
        <table className="person-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Address</th>
              <th>Type of ID</th>
              <th>ID No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {persons.map((person, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                    placeholder="Enter Name"
                    className="person-table-input"
                  />
                </td>
                <td>
                  <select
                    value={person.gender}
                    onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                    className="person-table-select"
                  >
                    <option value="">--Select--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={person.age}
                    onChange={(e) => handlePersonChange(index, 'age', e.target.value)}
                    placeholder="Enter Age"
                    className="person-table-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={person.address}
                    onChange={(e) => handlePersonChange(index, 'address', e.target.value)}
                    placeholder="Enter Address"
                    className="person-table-input"
                  />
                </td>
                <td>
                  <select
                    value={person.idType}
                    onChange={(e) => handlePersonChange(index, 'idType', e.target.value)}
                    className="person-table-select"
                  >
                    <option value="">--Select--</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="National ID">National ID</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={person.idNo}
                    onChange={(e) => handlePersonChange(index, 'idNo', e.target.value)}
                    placeholder="Enter ID No."
                    className="person-table-input"
                  />
                </td>
                <td>
                  {index === 0 ? (
                    <button type="button" className="person-add-btn" onClick={handleAddPerson}>
                      +
                    </button>
                  ) : (
                    <button type="button" className="person-remove-btn" onClick={() => handleRemovePerson(index)}>
                      -
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdditionalPersons;