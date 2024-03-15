import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import PharmaDashboard from "./pages/PharmaDashboard";
import AddMedicine from "./pages/AddMedicine";
import MedicineList from "./pages/MedicineList";
import PurchaseList from "./pages/PurchaseList";
import AddSupplier from "./pages/AddSupplier";
import SupplierList from "./pages/SupplierList";
import Pagination from "./components/Pagination";
import StockList from "./pages/StockList";
import AddPurchase from "./pages/AddPurchase";
import AddCategory from "./pages/AddCategory";
import CategoryList from "./pages/CategoryList";
import DoctorDashboard from "./pages/DoctorDashboard";import { AddPatient } from "./pages/AddPatient";
import PatientList from "./pages/PatientList";
import { AddPrescription } from "./pages/AddPrescription";
import PrescriptionList from "./pages/PrescriptionList";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/pharmadashboard" element={<PharmaDashboard />} />
          <Route path="/medicine/add_medicine" element={<AddMedicine />} />
          <Route path="/medicine/list" element={<MedicineList />} />
          <Route path="/medicine/category/add_category" element={<AddCategory />} />
          <Route path="/medicine/category/list" element={<CategoryList />} />
          <Route path="/purchase/add_purchase" element={<AddPurchase />} />
          <Route path="/purchase/list" element={<PurchaseList />} />
          <Route path="/supplier/add_supplier" element={<AddSupplier />} />
          <Route path="/supplier/list" element={<SupplierList />} />
          <Route path="/stock" element={<StockList />} />
          <Route path="/pagination" element={<Pagination />} />
          <Route path="/doctordashboard" element={<DoctorDashboard />} />
          <Route path="/patient/add_patient" element={<AddPatient />} />
          <Route path="/patient/list" element={<PatientList />} />
          <Route path="/prescription/add_prescription" element={<AddPrescription />} />
          <Route path="/prescription/list" element={<PrescriptionList />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
