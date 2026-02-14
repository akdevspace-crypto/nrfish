import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../Context/AppContext';
import LoadingScreen from '../../Components/LoadingScreen';

const BillingProtectedRoute = ({ children }) => {
    const { isSeller, sellerChecked } = useAppContext();

    if (!sellerChecked) {
        return <LoadingScreen />;
    }

    if (!isSeller) {
        return <Navigate to="/seller" replace />; // Redirect to seller login if not authenticated
    }

    return children;
};

export default BillingProtectedRoute;
