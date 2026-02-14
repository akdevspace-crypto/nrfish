import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../Context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CategoryList = () => {
    const { axios, currency, token } = useAppContext();
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/category/list?showAll=true');
            if (data.success) {
                setCategories(data.categories);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const removeCategory = async (id) => {
        try {
            const { data } = await axios.post('/api/category/delete', { id }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                fetchCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className='flex-1 px-5 pt-5 min-h-screen bg-gray-50'>
            <div className="flex justify-between items-center mb-6">
                <p className='text-2xl font-bold text-gray-800'>All Categories</p>
                <button
                    onClick={() => navigate('/seller/add-category')}
                    className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Add New
                </button>
            </div>

            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                {/* Header */}
                <div className='hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 items-center py-4 px-6 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                    <p>Image</p>
                    <p>Name</p>
                    <p>Sort Order</p>
                    <p>Status</p>
                    <p className='text-right'>Action</p>
                </div>

                {/* Rows */}
                {categories.map((item, index) => (
                    <div className='grid grid-cols-[1fr_3fr] md:grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 items-center py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors' key={index}>
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                            <img className='w-full h-full object-cover' src={item.image} alt={item.name} />
                        </div>
                        <p className='font-medium text-gray-800 text-base'>{item.name}</p>
                        <p className='text-gray-600 hidden md:block'>{item.sort_order}</p>
                        <p className={`hidden md:block font-medium ${item.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                        <div className='flex justify-end gap-2'>
                            <button
                                onClick={() => navigate(`/seller/edit-category/${item.id}`)} // Assuming edit route
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                            </button>
                            <button
                                onClick={() => removeCategory(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
