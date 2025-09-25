import { useState } from "react";
import { LogOut } from "lucide-react";

const LogoutButton = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");

    if (onLogout) onLogout();
  };

  return (
    <>
      {/* Round Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-orange-500 text-black hover:text-white rounded-full transition-colors duration-300"
        title="Logout"
      >
        <LogOut size={18} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
            {/* Modal Title */}
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              Confirm Logout
            </h2>

            {/* Modal Content */}
            <p className="text-gray-700 text-sm mb-6">
              Are you sure you want to logout? You'll be returned to the login screen.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
