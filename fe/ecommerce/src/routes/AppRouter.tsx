import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import DashboardPage from '../pages/admin/DashboardPage';
import CategoryPage from '../pages/admin/CategoryPage';
import AdminProductPage from '../pages/admin/ProductPage';
import SettingsPage from '../pages/admin/SettingsPage';
import CartPage from '../pages/user/CartPage';
import ProductPage from '../pages/user/ProductPage';
import ProductDetailPage from '../pages/user/ProductDetailPage';
import SavedPage from '../pages/user/SavedPage';
import { createBrowserRouter } from 'react-router-dom';

const AppRouter = createBrowserRouter([
    {
        path: '/',
        element: <UserLayout />,
        children: [
            {
                index: true,
                element: <ProductPage />
            },
            {
                path: 'products/:id',
                element: <ProductDetailPage />
            },
            {
                path: 'cart',
                element: <CartPage />
            },
            {
                path: 'saved',
                element: <SavedPage />
            }
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: 'category',
                element: <CategoryPage />
            },
            {
                path: 'product',
                element: <AdminProductPage />
            },
            {
                path: 'settings',
                element: <SettingsPage />
            }
        ]
    }
]);

export default AppRouter;
