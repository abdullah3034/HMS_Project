import { useEffect, useState } from "react";
import axios from "axios";
import "./OwnSettings.css";
import Ownsidebar from "../../../../components/owner/ownSidebar/Ownsidebar";

const siteLanguages = [
  { code: "af", name: "Afrikaans" }, { code: "sq", name: "Albanian" }, { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" }, { code: "hy", name: "Armenian" }, { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" }, { code: "be", name: "Belarusian" }, { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" }, { code: "bg", name: "Bulgarian" }, { code: "my", name: "Burmese" },
  { code: "ca", name: "Catalan" }, { code: "zh", name: "Chinese" }, { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" }, { code: "da", name: "Danish" }, { code: "nl", name: "Dutch" },
  { code: "en", name: "English" }, { code: "eo", name: "Esperanto" }, { code: "et", name: "Estonian" },
  { code: "fi", name: "Finnish" }, { code: "fr", name: "French" }, { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" }, { code: "de", name: "German" }, { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" }, { code: "he", name: "Hebrew" }, { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" }, { code: "is", name: "Icelandic" }, { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" }, { code: "ja", name: "Japanese" }, { code: "jv", name: "Javanese" },
  { code: "kn", name: "Kannada" }, { code: "kk", name: "Kazakh" }, { code: "km", name: "Khmer" },
  { code: "ko", name: "Korean" }, { code: "lo", name: "Lao" }, { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" }, { code: "mk", name: "Macedonian" }, { code: "ml", name: "Malayalam" },
  { code: "ms", name: "Malay" }, { code: "mr", name: "Marathi" }, { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" }, { code: "no", name: "Norwegian" }, { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" }, { code: "pt", name: "Portuguese" }, { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" }, { code: "ru", name: "Russian" }, { code: "sr", name: "Serbian" },
  { code: "si", name: "Sinhala" }, { code: "sk", name: "Slovak" }, { code: "sl", name: "Slovenian" },
  { code: "es", name: "Spanish" }, { code: "sw", name: "Swahili" }, { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" }, { code: "te", name: "Telugu" }, { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" }, { code: "uk", name: "Ukrainian" }, { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" }, { code: "vi", name: "Vietnamese" }, { code: "xh", name: "Xhosa" },
  { code: "zu", name: "Zulu" }
].sort((a, b) => a.name.localeCompare(b.name));

const SettingsPage = () => {
  const initialSettings = {
    siteTitle: "",
    siteLanguage: "en",
    hotelName: "",
    hotelEmail: "",
    hotelPhone: "",
    hotelWebsite: "",
    hotelMobile: "",
    hotelAddress: "",
    hotelTagline: "",
    gstRoom: "",
    cgstRoom: "",
    gstFood: "",
    cgstFood: "",
    gstLaundry: "",
    cgstLaundry: "",
    gstin: "",
    currency: "",
    currencySymbol: "",
    nationality: "",
    country: "",
    filterDateRange: "",
    lHeight: "",
    lWidth: ""
  };

  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState(null);
  const [siteLogo, setSiteLogo] = useState(null);

  // Fetch settings on mount
  useEffect(() => {
    axios.get("http://localhost:8000/api/settings")
      .then(res => setSettings(res.data))
      .catch(err => {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings.");
      });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Save settings and reset the form after successful save
 const handleSave = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();

    // Append settings fields
    for (const key in settings) {
      formData.append(key, settings[key]);
    }

    // Append the logo file if selected
    if (siteLogo) {
      formData.append("logo", siteLogo);
    }

    const response = await axios.put("http://localhost:8000/api/settings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      alert("Saved successfully!");
      setSettings(initialSettings);
      setSiteLogo(null);
    } else {
      alert("Save failed.");
    }
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Save failed.");
  }
};
  
  return (
    <div className="ownsettings-container">
      <Ownsidebar/>
      <form onSubmit={handleSave} className="ownsettings-form">
        {/* Site Settings */}
        <h2 className="ownsettings-section-title"><u>Site Settings</u></h2>
        <div className="ownsettings-grid-three-columns">
          <div className="ownsettings-form-group"><label>Site Page Title</label><input type="text" name="siteTitle" value={settings.siteTitle} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Site Language</label>
            <select name="siteLanguage" value={settings.siteLanguage} onChange={handleChange}>
              {siteLanguages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
          <div className="ownsettings-form-group"><label>Hotel Name</label><input type="text" name="hotelName" value={settings.hotelName} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Hotel E-mail</label><input type="email" name="hotelEmail" value={settings.hotelEmail} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Hotel Tagline</label><input type="text" name="hotelTagline" value={settings.hotelTagline} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Hotel Phone</label><input type="text" name="hotelPhone" value={settings.hotelPhone} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Hotel Mobile</label><input type="text" name="hotelMobile" value={settings.hotelMobile} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Hotel Website</label><input type="text" name="hotelWebsite" value={settings.hotelWebsite} onChange={handleChange} /></div>
          <div className="ownsettings-form-group"><label>Hotel Address</label><input type="text" name="hotelAddress" value={settings.hotelAddress} onChange={handleChange} /></div>
        </div>

        <div className="ownsettings-section-divider" />

        {/* GST */}
        <h2 className="ownsettings-section-title"><u>GST Settings</u></h2>
        <div className="ownsettings-horizontal-form">
          <div className="ownsettings-form-row"><label>GSTIN:</label><input type="text" name="gstin" value={settings.gstin} onChange={handleChange} /></div>

          <div className="ownsettings-filter-grid">
            <label>Room Rent GST(%)</label>
            <div className="ownsettings-form-group"><label>GST(%)</label><input type="text" name="gstRoom" value={settings.gstRoom} onChange={handleChange} /></div>
            <div className="ownsettings-form-group"><label>CGST(%)</label><input type="text" name="cgstRoom" value={settings.cgstRoom} onChange={handleChange} /></div>
          </div>

          <div className="ownsettings-filter-grid">
            <label>Food GST(%)</label>
            <div className="ownsettings-form-group"><label>GST(%)</label><input type="text" name="gstFood" value={settings.gstFood} onChange={handleChange} /></div>
            <div className="ownsettings-form-group"><label>CGST(%)</label><input type="text" name="cgstFood" value={settings.cgstFood} onChange={handleChange} /></div>
          </div>

          <div className="ownsettings-filter-grid">
            <label>Laundry GST(%)</label>
            <div className="ownsettings-form-group"><label>GST(%)</label><input type="text" name="gstLaundry" value={settings.gstLaundry} onChange={handleChange} /></div>
            <div className="ownsettings-form-group"><label>CGST(%)</label><input type="text" name="cgstLaundry" value={settings.cgstLaundry} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="ownsettings-section-divider" />

        {/* Currency */}
        <h2 className="ownsettings-section-title"><u>Currency Settings</u></h2>
        <div className="ownsettings-horizontal-form">
          <div className="ownsettings-form-row"><label>Currency:</label><input type="text" name="currency" value={settings.currency} onChange={handleChange} placeholder="SriLankan Rupees" /></div>
          <div className="ownsettings-form-row"><label>Currency Symbol:</label><input type="text" name="currencySymbol" value={settings.currencySymbol} onChange={handleChange} placeholder="RS." /></div>
        </div>

        <div className="ownsettings-section-divider" />

        {/* Defaults */}
        <h2 className="ownsettings-section-title"><u>Default Settings</u></h2>
        <div className="ownsettings-horizontal-form">
          <div className="ownsettings-form-row"><label>Nationality:</label><input type="text" name="nationality" value={settings.nationality} onChange={handleChange} /></div>
          <div className="ownsettings-form-row"><label>Country:</label><input type="text" name="country" value={settings.country} onChange={handleChange} /></div>
          <div className="ownsettings-form-row"><label>Default Filter Dates Range (Days):</label><input type="text" name="filterDateRange" value={settings.filterDateRange} onChange={handleChange} /></div>
          <div className="ownsettings-form-row"><label>Site Logo:</label><input type="file" onChange={(e) => setSiteLogo(e.target.files[0])} /></div>
          <div className="ownsettings-form-row"><label>Logo Height (px):</label><input type="text" name="lHeight" value={settings.lHeight} onChange={handleChange} /></div>
          <div className="ownsettings-form-row"><label>Logo Width (px):</label><input type="text" name="lWidth" value={settings.lWidth} onChange={handleChange} /></div>
        </div>

        <button type="submit" className="ownsettings-save-button">Save Settings</button>
      </form>
    </div>
  );
};

export default SettingsPage;