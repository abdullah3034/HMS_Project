import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPurchasedCartItems } from "../../api/cartApi";
import { addNewEmployee, updateOwnerEmployee } from "../../api/employeeApi";
import { enqueueSnackbar } from "notistack";
import { getUserFromToken } from "../../util/jwt.pharser";

const AddEmployeeDialog = ({ open, onClose, defaultValues }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    getValues,
  } = useForm({
    defaultValues: defaultValues || {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: [],
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: [],
      });
    }
  }, [defaultValues, reset]);

  const user = getUserFromToken();
  const email = user?.ownerEmail;
  const role = user?.role[0];

  const queryClient = useQueryClient();
  const { data: purchasedItemData, isFetching: isPurchasedItemFetching } =
    useQuery({
      queryKey: ["cart-items", email, role],
      queryFn: () => getPurchasedCartItems(email, role),
      enabled: !!email && !!role,
    });

  const [isActive, setIsActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleCheckboxChange = (roleName) => {
    const currentrole = getValues("role") || [];
    const updatedrole = currentrole.includes(roleName)
      ? currentrole.filter((r) => r !== roleName)
      : [...currentrole, roleName];

    setValue("role", updatedrole);
  };

  const onSubmit = (data) => {
    const shouldValidatePassword =
      !defaultValues || (defaultValues && isActive);

    if (shouldValidatePassword && data.password !== data.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const email = localStorage.getItem("email");
    const payload = { ...data, ownerEmail: email, isActive };

    if (!defaultValues) {
      addNewEmployeeMutation(payload);
    } else {
      updateEmployeeMutation(payload);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const { mutate: addNewEmployeeMutation, isPending: isAddingEmployee } =
    useMutation({
      mutationFn: addNewEmployee,
      onSuccess: () => {
        enqueueSnackbar("Employee Added Successfully!", { variant: "success" });
        queryClient.invalidateQueries({ queryKey: ["owner-employee", email] });
        onClose();
        reset();
      },
      onError: (error) => {
        const serverMessage =
          error?.response?.data?.message || "Failed to add Employee";
        enqueueSnackbar(serverMessage, { variant: "error" });
      },
    });
  const { mutate: updateEmployeeMutation, isPending: isUpdatingEmployee } =
    useMutation({
      mutationFn: updateOwnerEmployee,
      onSuccess: () => {
        enqueueSnackbar("Employee Updated Successfully!", {
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["owner-employee", email] });
        onClose();
        reset();
      },
      onError: (error) => {
        const serverMessage =
          error?.response?.data?.message || "Failed to Update Employee";
        enqueueSnackbar(serverMessage, { variant: "error" });
      },
    });
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-14 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">Add New Employee</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            className="w-full border rounded-lg px-4 py-2"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full border rounded-lg px-4 py-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          {/* Dropdown checkbox for role */}
          <Controller
            control={control}
            name="role"
            rules={{
              validate: (value) =>
                value.length > 0 || "At least one role must be selected",
            }}
            render={({ field }) => (
              <div className="relative">
                <div
                  onClick={toggleDropdown}
                  className="w-full border rounded-lg px-4 py-2 bg-white cursor-pointer"
                >
                  {isPurchasedItemFetching
                    ? "Loading role..."
                    : field.value.length > 0
                    ? field.value.join(", ")
                    : "Select role"}
                </div>

                {dropdownOpen && !isPurchasedItemFetching && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {purchasedItemData?.map((pkg) => (
                      <label
                        key={pkg._id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={field.value.includes(pkg.name)}
                          onChange={() => handleCheckboxChange(pkg.name)}
                        />
                        {pkg.name}
                      </label>
                    ))}
                  </div>
                )}

                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>
            )}
          />

          {defaultValues && (
            <div className="flex items-center gap-2 m-2">
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Need To Change the Password
              </label>
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                defaultChecked={defaultValues.isActive}
                className="w-10 h-5 m-2 rounded-full appearance-none bg-gray-300 cursor-pointer checked:bg-blue-500 relative transition-colors duration-300
                  before:content-[''] before:w-5 before:h-5 before:absolute before:top-0 before:left-0 before:bg-white before:rounded-full before:shadow-md before:transition-transform before:duration-300 checked:before:translate-x-5"
              />
            </div>
          )}

          {(!defaultValues || (defaultValues && isActive)) && (
            <>
              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Please enter a password",
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </>
          )}

          <button
            type="submit"
            className="bg-blue-600 w-full hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            disabled={isAddingEmployee || isUpdatingEmployee}
          >
            {isAddingEmployee || isUpdatingEmployee ? (
              <svg
                className="w-6 h-6 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="6"
                />
                <path
                  className="opacity-100"
                  fill="white"
                  d="M4 12a8 8 0 018-8V0a12 12 0 00-12 12h4z"
                />
              </svg>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeDialog;
