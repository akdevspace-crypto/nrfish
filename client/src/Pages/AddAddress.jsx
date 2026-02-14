import React, { useEffect, useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className='w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none
     text-gray-900 font-medium placeholder:text-gray-400 focus:border-[#42cbf5] focus:ring-1 focus:ring-[#42cbf5] transition-all'
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
  />
);

function AddAddress() {
  const { axios, user, navigate, allowedPincodes } = useAppContext();

  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: address.firstName,
        last_name: address.lastName,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode
      };

      if (!allowedPincodes.includes(address.pincode.trim())) {
        toast.error("We currently deliver only within Coimbatore.");
        return;
      }
      const { data } = await axios.post('/api/address/add', payload);

      if (data.success) {
        toast.success(data.message);
        navigate('/cart');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/cart');
    }
  }, [user]);

  return (
    <div className='min-h-screen bg-gray-50 pt-[120px] pb-20 px-4 md:px-8'>
      <div className='max-w-3xl mx-auto'>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">ADD SHIPPING ADDRESS</h1>
          <p className="text-gray-500">Where should we deliver your fresh catch?</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <form onSubmit={onSubmitHandler} className='space-y-6'>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <InputField handleChange={handleChange} address={address} name="firstName" type="text" placeholder="e.g. John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <InputField handleChange={handleChange} address={address} name="lastName" type="text" placeholder="e.g. Doe" />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <InputField handleChange={handleChange} address={address} name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <InputField handleChange={handleChange} address={address} name="phone" type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
              <InputField handleChange={handleChange} address={address} name="address" type="text" placeholder="Flat / House No / Building / Street Name" />
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">City</label>
                <InputField handleChange={handleChange} address={address} name="city" type="text" placeholder="City" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">State</label>
                <InputField handleChange={handleChange} address={address} name="state" type="text" placeholder="State" />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Country</label>
                <InputField handleChange={handleChange} address={address} name="country" type="text" placeholder="Country" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pincode</label>
                <InputField handleChange={handleChange} address={address} name="pincode" type="number" placeholder="6 DIGIT PIN" />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className='w-full bg-[#42cbf5] hover:bg-[#1dc1f2] text-black font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg'
              >
                SAVE ADDRESS
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAddress;
