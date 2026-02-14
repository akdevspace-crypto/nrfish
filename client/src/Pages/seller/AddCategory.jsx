import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../Context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const AddCategory = () => {
    const { axios, token } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();

    const [image, setImage] = useState(false);
    const [name, setName] = useState("");
    const [sortOrder, setSortOrder] = useState(0);
    const [status, setStatus] = useState("active");
    const [loading, setLoading] = useState(false);
    const [existingImage, setExistingImage] = useState("");

    // Load data if editing
    useEffect(() => {
        if (id) {
            const fetchCat = async () => {
                try {
                    const { data } = await axios.get('/api/category/list?showAll=true');
                    if (data.success) {
                        const cat = data.categories.find(c => c.id == id);
                        if (cat) {
                            setName(cat.name);
                            setSortOrder(cat.sort_order);
                            setStatus(cat.status);
                            setExistingImage(cat.image);
                        }
                    }
                } catch (err) { console.error(err) }
            }
            fetchCat();
        }
    }, [id, axios]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            if (image) formData.append("image", image);
            formData.append("sortOrder", sortOrder);
            formData.append("status", status);

            // Sending default values for fields we removed from UI but DB might expect (though they have defaults in DB schema too)
            formData.append("overlayColor", "#000000");
            formData.append("ctaText", "");

            let data;
            if (id) {
                const res = await axios.post(`/api/category/update/${id}`, formData, { headers: { token } });
                data = res.data;
            } else {
                const res = await axios.post("/api/category/add", formData, { headers: { token } });
                data = res.data;
            }

            if (data.success) {
                toast.success(data.message);
                navigate('/seller/category-list');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex-1 min-h-screen px-4 sm:px-8 py-8 bg-gray-50'>
            <div className="flex justify-between items-center mb-8">
                <h1 className='text-3xl font-bold text-gray-800'>{id ? "Edit Category" : "Add New Category"}</h1>
            </div>

            <div className='flex flex-col gap-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100'>
                {/* Image Upload */}
                <div className="flex flex-col gap-3">
                    <p className='text-lg font-semibold text-gray-700'>Category Image</p>
                    <label htmlFor="image" className='cursor-pointer group relative w-full h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex items-center justify-center bg-gray-50'>
                        {image ? (
                            <img className='w-full h-full object-cover' src={URL.createObjectURL(image)} alt="" />
                        ) : existingImage ? (
                            <img className='w-full h-full object-cover' src={existingImage} alt="" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 group-hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <span className="text-xs mt-2 font-medium">Upload Image</span>
                            </div>
                        )}
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                    </label>
                    <p className="text-xs text-gray-400">Recommended: Landscape or Square (e.g. 600x400)</p>
                </div>

                {/* Name */}
                <div className='flex flex-col gap-2'>
                    <p className='text-base font-semibold text-gray-700'>Category Name</p>
                    <input xmlns="http://www.w3.org/2000/svg" onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='e.g., Seafood' required className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all outline-none' />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sort Order */}
                    <div className='flex flex-col gap-2'>
                        <p className='text-base font-semibold text-gray-700'>Sort Order</p>
                        <input onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} type="number" placeholder='0' className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all outline-none' />
                    </div>

                    {/* Status */}
                    <div className='flex flex-col gap-2'>
                        <p className='text-base font-semibold text-gray-700'>Status</p>
                        <select onChange={(e) => setStatus(e.target.value)} value={status} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all outline-none bg-white'>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <button type='submit' disabled={loading} className='w-full max-w-xs mt-6 bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed'>
                    {loading ? "Saving..." : (id ? "Update" : "Add")}
                </button>
            </div>
        </form>
    );
};

export default AddCategory;
