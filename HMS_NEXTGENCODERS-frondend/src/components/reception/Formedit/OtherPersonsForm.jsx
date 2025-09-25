import React from "react";

const OtherPersonsForm = ({
  persons,
  setPersons,
  getTextColor
}) => {
  const handlePersonChange = (index, field, value) => {
    const updatedPersons = [...persons];
    updatedPersons[index][field] = value;
    setPersons(updatedPersons);
  };

  const handleAddPerson = () => {
    setPersons([...persons, { name: '', gender: '', age: '', address: '', idType: '', idNo: '' }]);
  };

  const handleRemovePerson = (index) => {
    if (persons.length > 1) {
      setPersons(persons.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="editform-container">
      <h2 className="editform-form-heading">Information of Other Person</h2>
      <div className="editperson-table-responsive">
        <table className="editperson-table">
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
                    style={{ color: getTextColor(person.name) }}
                    className="edit-table-input"
                  />
                </td>
                <td>
                  <select
                    value={person.gender}
                    onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                    style={{ color: getTextColor(person.gender) }}
                    className="edit-table-select"
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
                    style={{ color: getTextColor(person.age) }}
                    className="edit-table-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={person.address}
                    onChange={(e) => handlePersonChange(index, 'address', e.target.value)}
                    placeholder="Enter Address"
                    style={{ color: getTextColor(person.address) }}
                    className="edit-table-input"
                  />
                </td>
                <td>
                  <select
                    value={person.idType}
                    onChange={(e) => handlePersonChange(index, 'idType', e.target.value)}
                    style={{ color: getTextColor(person.idType) }}
                    className="edit-table-select"
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
                    style={{ color: getTextColor(person.idNo) }}
                    className="edit-table-input"
                  />
                </td>
                <td>
                  {index === 0 ? (
                    <button type="button" className="add-btn" onClick={handleAddPerson}>
                      +
                    </button>
                  ) : (
                    <button type="button" className="remove-btn" onClick={() => handleRemovePerson(index)}>
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

export default OtherPersonsForm;