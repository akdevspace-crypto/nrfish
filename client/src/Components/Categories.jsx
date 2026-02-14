import React from 'react'
import { categories } from '../assets/assets'
import { useAppContext } from '../Context/AppContext'

function Categories() {
  const { navigate } = useAppContext();
  return (
    <div className="mt-5 md:mt-16" id="categories">
      <p className='flex flex-cols justify-center items-center text-2xl md:text-3xl font-medium'>Categories</p>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7 mt-6 gap-6'>
        {categories.map((categories, index) => (

          <div key={index} className='group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center'
            style={{ backgroundColor: categories.bgColor }}
            onClick={() => {
              navigate(`/products/${categories.path.toLowerCase()}`);
              scrollTo(0, 0)
            }}
          >
            <img src={categories.image} alt="" className='group-hover:scale-108 transition max-w-28' />
            <p className='text-sm font-medium'>{categories.text}</p>
          </div>

        ))}

      </div>
    </div>
  )
}

export default Categories;