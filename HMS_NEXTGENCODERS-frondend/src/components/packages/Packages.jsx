import { usePackages } from '../../context/PackagesContext';

const Packages = () => {
  const { packages, addToCart } = usePackages();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Available Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((packageItem) => (
          <div
            key={packageItem.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{packageItem.name}</h3>
            <p className="text-gray-600 mb-4">{packageItem.description}</p>
            <div className="mb-4">
              <p className="text-2xl font-bold text-blue-600">${packageItem.price}</p>
            </div>
            <ul className="mb-6 space-y-2">
              {packageItem.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => addToCart(packageItem)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Packages;