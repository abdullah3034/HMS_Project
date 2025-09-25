import axios from "axios";

export const addNewEmployee = async (employee) => {
  console.log("hi" + employee);
  const res = await axios.post(
    `http://localhost:8000/api/auth/register`,
    employee
  );
  return res.data;
};

export const fetchEmployeeList = async (email) => {
  console.log("hi" + email);
  const res = await axios.get(
    `http://localhost:8000/api/user/${email}/owner-employee`
  );
  return res.data;
};

export const updateOwnerEmployee = async (employee) => {
  console.log("hi " + employee);
  const res = await axios.put(
    `http://localhost:8000/api/user/update-employee`,
    employee
  );
  return res.data;
};

export const deleteOwnerEmployee = async (id) => {
  const res = await axios.delete(
    `http://localhost:8000/api/user/${id}/delete-employee`
  );
  return res.data;
};
