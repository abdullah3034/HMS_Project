import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-teal-800 to-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/favicon.svg" alt="Nexus Hotel" className="w-10 h-10" />
              <h3 className="text-xl font-bold">Nexus HMS</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Premium hotel management system delivering exceptional guest
              experiences and streamlined operations for modern hospitality.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-teal-200">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Reservations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Guest Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Room Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-teal-200">Services</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Property Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Online Booking
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Billing & Invoicing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Staff Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-100 hover:text-white transition-colors text-sm"
                >
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-teal-200">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-teal-300 mt-1 flex-shrink-0" />
                <p className="text-blue-100 text-sm">
                  123 Hospitality Drive
                  <br />
                  Business District
                  <br />
                  City, State 12345
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <p className="text-blue-100 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <p className="text-blue-100 text-sm">support@nexushotel.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} Nexus Hotel Management System. All
              rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-blue-200 hover:text-white text-sm transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
