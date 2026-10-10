import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './contexts/ShopContext';
import Auth from './components/Auth';
import Home from './pages/Home';

// Shops
import ShopList from './pages/shops/ShopList';
import ShopCreate from './pages/shops/ShopCreate';
import ShopView from './pages/shops/ShopView';
import ShopEdit from './pages/shops/ShopEdit';
import ShopItems from './pages/shops/ShopItems';
import ShopSales from './pages/shops/ShopSales';
import ShopExpenses from './pages/shops/ShopExpenses';

// Stores
import StoreList from './pages/stores/StoreList';
import StoreCreate from './pages/stores/StoreCreate';
import StoreView from './pages/stores/StoreView';
import StoreEdit from './pages/stores/StoreEdit';
import StoreItems from './pages/stores/StoreItems';

// Categories
import CategoryList from './pages/categories/CategoryList';
import CategoryCreate from './pages/categories/CategoryCreate';
import CategoryView from './pages/categories/CategoryView';
import CategoryEdit from './pages/categories/CategoryEdit';

// Item Types (superadmin)
import ItemTypeList from './pages/item-types/ItemTypeList';
import ItemTypeCreate from './pages/item-types/ItemTypeCreate';
import ItemTypeView from './pages/item-types/ItemTypeView';
import ItemTypeEdit from './pages/item-types/ItemTypeEdit';

// Companies
import CompanyList from './pages/companies/CompanyList';
import CompanyCreate from './pages/companies/CompanyCreate';
import CompanyView from './pages/companies/CompanyView';
import CompanyEdit from './pages/companies/CompanyEdit';

// Items
import ItemList from './pages/items/ItemList';
import ItemCreate from './pages/items/ItemCreate';
import ItemView from './pages/items/ItemView';
import ItemEdit from './pages/items/ItemEdit';
import TransferItem from './pages/items/TransferItem';
import StockTransferList from './pages/stock-transfers/StockTransferList';
import StockTransferCreate from './pages/stock-transfers/StockTransferCreate';
import StockTransferView from './pages/stock-transfers/StockTransferView';
import StockTransferEdit from './pages/stock-transfers/StockTransferEdit';

// Sales
import SaleList from './pages/sales/SaleList';
import SaleCreate from './pages/sales/SaleCreate';
import SaleView from './pages/sales/SaleView';
import SaleEdit from './pages/sales/SaleEdit';
import PromiseList from './pages/promises/PromiseList';

// Services
import ServiceList from './pages/services/ServiceList';
import ServiceCreate from './pages/services/ServiceCreate';
import ServiceView from './pages/services/ServiceView';
import ServiceEdit from './pages/services/ServiceEdit';

// Customers
import CustomerList from './pages/customers/CustomerList';
import CustomerCreate from './pages/customers/CustomerCreate';
import CustomerView from './pages/customers/CustomerView';
import CustomerEdit from './pages/customers/CustomerEdit';

// Sellers
import SellerList from './pages/sellers/SellerList';
import SellerCreate from './pages/sellers/SellerCreate';
import SellerView from './pages/sellers/SellerView';
import SellerEdit from './pages/sellers/SellerEdit';

// Installments
import SaleInstallmentList from './pages/installments/SaleInstallmentList';
import InstallmentList from './pages/installments/InstallmentList';
import InstallmentPlanCreate from './pages/installments/InstallmentPlanCreate';
import InstallmentPlanView from './pages/installments/InstallmentPlanView';
import InstallmentPlanEdit from './pages/installments/InstallmentPlanEdit';

// Orders
import OrderList from './pages/orders/OrderList';
import OrderCreate from './pages/orders/OrderCreate';
import OrderView from './pages/orders/OrderView';
import OrderEdit from './pages/orders/OrderEdit';

// Purchases
import PurchaseList from './pages/purchases/PurchaseList';
import PurchaseCreate from './pages/purchases/PurchaseCreate';
import PurchaseView from './pages/purchases/PurchaseView';
import PurchaseEdit from './pages/purchases/PurchaseEdit';

// Expenses
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseCreate from './pages/expenses/ExpenseCreate';
import ExpenseView from './pages/expenses/ExpenseView';
import ExpenseEdit from './pages/expenses/ExpenseEdit';
import AdminUsers from './pages/admin/AdminUsers';
import UserView from './pages/admin/UserView';
import UserEdit from './pages/admin/UserEdit';
import UserPermissions from './pages/permissions/UserPermissions';
import { defaultHomePath, getToken, hasPermission, isAuthenticated, isSuperAdmin, isTenantAdmin } from './services/session';

import './App.css';

const RequireSuperAdmin = ({ children }) => {
  if (!getToken() || !isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  if (!isSuperAdmin()) {
    return <Navigate to={defaultHomePath()} replace />;
  }
  return children;
};

const RequirePermission = ({ permission, children }) => {
  if (!getToken() || !isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  const needed = Array.isArray(permission) ? permission : [permission];
  if (needed.some((entry) => !hasPermission(entry))) {
    return <Navigate to={defaultHomePath()} replace />;
  }
  return children;
};

const RequirePermissionsAdmin = ({ children }) => {
  if (!getToken() || !isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  if (!hasPermission('users') || (!isSuperAdmin() && !isTenantAdmin())) {
    return <Navigate to={defaultHomePath()} replace />;
  }
  return children;
};

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<RequirePermission permission="dashboard"><Home /></RequirePermission>} />
          <Route path="/admin/users" element={<RequireSuperAdmin><AdminUsers /></RequireSuperAdmin>} />
          <Route path="/admin/users/:id/edit" element={<RequireSuperAdmin><UserEdit /></RequireSuperAdmin>} />
          <Route path="/admin/users/:id" element={<RequireSuperAdmin><UserView /></RequireSuperAdmin>} />
          <Route path="/permissions" element={<RequirePermissionsAdmin><UserPermissions /></RequirePermissionsAdmin>} />
          
          {/* Shops Routes */}
          <Route path="/shops" element={<RequirePermission permission="shops"><ShopList /></RequirePermission>} />
          <Route path="/shops/create" element={<RequirePermission permission="shops.write"><ShopCreate /></RequirePermission>} />
          <Route path="/shops/:id" element={<RequirePermission permission="shops"><ShopView /></RequirePermission>} />
          <Route path="/shops/:id/edit" element={<RequirePermission permission="shops"><ShopEdit /></RequirePermission>} />
          <Route path="/shops/:id/items" element={<RequirePermission permission={['shops', 'items']}><ShopItems /></RequirePermission>} />
          <Route path="/shops/:id/sales" element={<RequirePermission permission={['shops', 'sales']}><ShopSales /></RequirePermission>} />
          <Route path="/shops/:id/expenses" element={<RequirePermission permission={['shops', 'expenses']}><ShopExpenses /></RequirePermission>} />
          
          {/* Stores Routes */}
          <Route path="/stores" element={<RequirePermission permission="stores"><StoreList /></RequirePermission>} />
          <Route path="/stores/create" element={<RequirePermission permission="stores.write"><StoreCreate /></RequirePermission>} />
          <Route path="/stores/:id" element={<RequirePermission permission="stores"><StoreView /></RequirePermission>} />
          <Route path="/stores/:id/edit" element={<RequirePermission permission="stores"><StoreEdit /></RequirePermission>} />
          <Route path="/stores/:id/items" element={<RequirePermission permission={['stores', 'items']}><StoreItems /></RequirePermission>} />
          
          {/* Categories Routes */}
          <Route path="/categories" element={<RequirePermission permission="categories"><CategoryList /></RequirePermission>} />
          <Route path="/categories/create" element={<RequirePermission permission="categories.write"><CategoryCreate /></RequirePermission>} />
          <Route path="/categories/:id" element={<RequirePermission permission="categories"><CategoryView /></RequirePermission>} />
          <Route path="/categories/:id/edit" element={<RequirePermission permission="categories"><CategoryEdit /></RequirePermission>} />

          {/* Item Types — superadmin only */}
          <Route path="/item-types" element={<RequireSuperAdmin><ItemTypeList /></RequireSuperAdmin>} />
          <Route path="/item-types/create" element={<RequireSuperAdmin><ItemTypeCreate /></RequireSuperAdmin>} />
          <Route path="/item-types/:id" element={<RequireSuperAdmin><ItemTypeView /></RequireSuperAdmin>} />
          <Route path="/item-types/:id/edit" element={<RequireSuperAdmin><ItemTypeEdit /></RequireSuperAdmin>} />
          
          {/* Companies Routes */}
          <Route path="/companies" element={<RequirePermission permission="companies"><CompanyList /></RequirePermission>} />
          <Route path="/companies/create" element={<RequirePermission permission="companies.write"><CompanyCreate /></RequirePermission>} />
          <Route path="/companies/:id" element={<RequirePermission permission="companies"><CompanyView /></RequirePermission>} />
          <Route path="/companies/:id/edit" element={<RequirePermission permission="companies"><CompanyEdit /></RequirePermission>} />
          
          {/* Items Routes */}
          <Route path="/items" element={<RequirePermission permission="items"><ItemList /></RequirePermission>} />
          <Route path="/items/create" element={<RequirePermission permission="items"><ItemCreate /></RequirePermission>} />
          <Route path="/items/:id" element={<RequirePermission permission="items"><ItemView /></RequirePermission>} />
          <Route path="/items/:id/edit" element={<RequirePermission permission="items"><ItemEdit /></RequirePermission>} />
          <Route path="/items/transfer" element={<RequirePermission permission="issues"><TransferItem /></RequirePermission>} />

          <Route path="/stock-transfers" element={<RequirePermission permission="issues"><StockTransferList /></RequirePermission>} />
          <Route path="/stock-transfers/create" element={<RequirePermission permission="issues"><StockTransferCreate /></RequirePermission>} />
          <Route path="/stock-transfers/:id" element={<RequirePermission permission="issues"><StockTransferView /></RequirePermission>} />
          <Route path="/stock-transfers/:id/edit" element={<RequirePermission permission="issues"><StockTransferEdit /></RequirePermission>} />
          
          {/* Sales Routes */}
          <Route path="/sales" element={<RequirePermission permission="sales"><SaleList /></RequirePermission>} />
          <Route path="/sales/create" element={<RequirePermission permission="sales"><SaleCreate /></RequirePermission>} />
          <Route path="/sales/:id" element={<RequirePermission permission="sales"><SaleView /></RequirePermission>} />
          <Route path="/sales/:id/edit" element={<RequirePermission permission="sales"><SaleEdit /></RequirePermission>} />
          <Route path="/promises" element={<RequirePermission permission="sales"><PromiseList /></RequirePermission>} />

          {/* Customers Routes */}
          <Route path="/customers" element={<RequirePermission permission="customers.read"><CustomerList /></RequirePermission>} />
          <Route path="/customers/create" element={<RequirePermission permission="customers.write"><CustomerCreate /></RequirePermission>} />
          <Route path="/customers/:id" element={<RequirePermission permission="customers.read"><CustomerView /></RequirePermission>} />
          <Route path="/customers/:id/edit" element={<RequirePermission permission="customers.write"><CustomerEdit /></RequirePermission>} />

          {/* Sellers Routes */}
          <Route path="/sellers" element={<RequirePermission permission="sellers.read"><SellerList /></RequirePermission>} />
          <Route path="/sellers/create" element={<RequirePermission permission="sellers.write"><SellerCreate /></RequirePermission>} />
          <Route path="/sellers/:id" element={<RequirePermission permission="sellers.read"><SellerView /></RequirePermission>} />
          <Route path="/sellers/:id/edit" element={<RequirePermission permission="sellers.write"><SellerEdit /></RequirePermission>} />

          {/* Services Routes */}
          <Route path="/services" element={<RequirePermission permission="services.read"><ServiceList /></RequirePermission>} />
          <Route path="/services/create" element={<RequirePermission permission="services.write"><ServiceCreate /></RequirePermission>} />
          <Route path="/services/:id" element={<RequirePermission permission="services.read"><ServiceView /></RequirePermission>} />
          <Route path="/services/:id/edit" element={<RequirePermission permission="services.write"><ServiceEdit /></RequirePermission>} />

          {/* Sale installments (credit sales with a payment plan) */}
          <Route path="/installments" element={<RequirePermission permission="sales"><SaleInstallmentList /></RequirePermission>} />

          {/* Standalone installment plans */}
          <Route path="/installment-plans" element={<RequirePermission permission="installments.read"><InstallmentList /></RequirePermission>} />
          <Route path="/installments/plans/create" element={<RequirePermission permission="installments.write"><InstallmentPlanCreate /></RequirePermission>} />
          <Route path="/installments/plans/:id" element={<RequirePermission permission="installments.read"><InstallmentPlanView /></RequirePermission>} />
          <Route path="/installments/plans/:id/edit" element={<RequirePermission permission="installments.write"><InstallmentPlanEdit /></RequirePermission>} />
          
          {/* Orders Routes — not in the module catalog; only super_admin can open via URL */}
          <Route path="/orders" element={<RequirePermission permission="orders"><OrderList /></RequirePermission>} />
          <Route path="/orders/create" element={<RequirePermission permission="orders"><OrderCreate /></RequirePermission>} />
          <Route path="/orders/:id" element={<RequirePermission permission="orders"><OrderView /></RequirePermission>} />
          <Route path="/orders/:id/edit" element={<RequirePermission permission="orders"><OrderEdit /></RequirePermission>} />
          
          {/* Purchases Routes */}
          <Route path="/purchases" element={<RequirePermission permission="purchases"><PurchaseList /></RequirePermission>} />
          <Route path="/purchases/create" element={<RequirePermission permission="purchases"><PurchaseCreate /></RequirePermission>} />
          <Route path="/purchases/:id" element={<RequirePermission permission="purchases"><PurchaseView /></RequirePermission>} />
          <Route path="/purchases/:id/edit" element={<RequirePermission permission="purchases"><PurchaseEdit /></RequirePermission>} />
          
          {/* Expenses Routes */}
          <Route path="/expenses" element={<RequirePermission permission="expenses"><ExpenseList /></RequirePermission>} />
          <Route path="/expenses/create" element={<RequirePermission permission="expenses"><ExpenseCreate /></RequirePermission>} />
          <Route path="/expenses/:id" element={<RequirePermission permission="expenses"><ExpenseView /></RequirePermission>} />
          <Route path="/expenses/:id/edit" element={<RequirePermission permission="expenses"><ExpenseEdit /></RequirePermission>} />
          
          <Route
            path="*"
            element={
              getToken() && isAuthenticated()
                ? <Navigate to={defaultHomePath()} replace />
                : <Navigate to="/" replace />
            }
          />
          </Routes>
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;
